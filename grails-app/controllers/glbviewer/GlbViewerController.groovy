package glbviewer

import grails.plugin.springsecurity.annotation.Secured
import grails.gorm.transactions.Transactional
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.UUID
import plm.PlmCadVersionFileService
import plm.PlmFreeCadPart
import plm.PlmPreviewStorageService
import plm.PlmFreeCadSecurityService

@Secured(['ROLE_PLM_USER', 'ROLE_ADMIN'])
class GlbViewerController {
    def springSecurityService
    PlmCadVersionFileService plmCadVersionFileService
    PlmPreviewStorageService plmPreviewStorageService
    PlmFreeCadSecurityService plmFreeCadSecurityService

    private String username() { springSecurityService.currentUser.username.toString() }
    private Path storage() {
        String configured = grailsApplication.config.getProperty('pm.viewer.storageDir', String,
                System.getProperty('user.home') + '/parts-manager-viewer-models')
        Path root = Paths.get(configured).toAbsolutePath().normalize()
        Files.createDirectories(root)
        root
    }
    private void jsonResponse(Object data, int status = 200) {
        render(status: status, contentType: 'application/json', text: JsonOutput.toJson(data))
    }

    def index() { [viewerUsername:username()] }

    def models() {
        jsonResponse(ViewerModel.list(sort: 'dateCreated', order: 'desc', max: 500).collect { m ->
            [id:m.id, name:m.filename, size:m.byteSize, uploadedBy:m.uploadedBy,
             url:createLink(controller:'glbViewer', action:'modelFile', id:m.id)]
        })
    }

    /** CAD geometry units stored by the PLM metadata importer. */
    private static String plmUnits(PlmFreeCadPart part) {
        String raw = part.cadLengthUnit?.toString()?.trim()?.toLowerCase(Locale.ROOT)
        Map aliases = [millimeter:'mm', millimeters:'mm', millimetre:'mm', millimetres:'mm',
            centimeter:'cm', centimeters:'cm', centimetre:'cm', centimetres:'cm',
            meter:'m', meters:'m', metre:'m', metres:'m', inch:'in', inches:'in',
            foot:'ft', feet:'ft']
        String unit = (aliases[raw] ?: raw) as String
        return unit in ['mm','cm','m','in','ft'] ? unit : null
    }

    /** ASMJ wins over GLB. Keep missing parts addressable for the model tree. */
    private Map plmModelDescriptor(PlmFreeCadPart part) {
        Integer major = part.majorVersion ?: 1
        Integer minor = part.minorVersion ?: 0
        def asm = plmCadVersionFileService.listForVersion(part.id as Long, major, minor, 'ASSEMBLY')
            .find { it.originalName?.toLowerCase(Locale.ROOT)?.endsWith('.asmj') }
        boolean glb = plmPreviewStorageService.modelFile(part).isFile()
        String format = asm ? 'asmj' : (glb ? 'glb' : 'missing')
        [id:part.id, name:part.originalName ?: part.label ?: 'Part ' + part.id,
         filename:part.originalName ?: part.label, label:part.label, lifecycleState:part.lifecycleState?.toString(), thumbnailUrl:createLink(controller:'plm', action:'previewPart', id:part.id), source:'plm', cadVersion:"${major}.${minor}".toString(),
         geometryUnits:plmUnits(part), format:format,
         url:asm ? createLink(controller:'plmManagedFile', action:'download', id:asm.id) :
             (glb ? createLink(controller:'plm',action:'previewGlb',id:part.id) : null)]
    }

    def plmModels() {
        def available = PlmFreeCadPart.list(max:1000, sort:'id', order:'desc').findAll { part ->
            part.active == true && part.nextVersion == null &&
                plmFreeCadSecurityService.canDownloadFile(part)
        }
        jsonResponse(available.collect { part -> plmModelDescriptor(part) })
    }

    /** Search current PLM parts; never expose parts the caller cannot download. */
    def searchPlmParts() {
        String query = (params.q ?: '').toString().trim().toLowerCase(Locale.ROOT)
        if (query.length() > 160) { jsonResponse([error:'Search is too long'], 400); return }
        List matches = []
        // Search is capped to avoid rendering unbounded result sets in the modal.
        PlmFreeCadPart.list(max:5000, sort:'id', order:'desc').each { part ->
            if (matches.size() >= 100) return
            if (part.active != true || part.nextVersion != null ||
                !plmFreeCadSecurityService.canDownloadFile(part)) return
            String filename = part.originalName ?: ''
            String label = part.label ?: ''
            if (!query || part.id.toString().contains(query) ||
                filename.toLowerCase(Locale.ROOT).contains(query) ||
                label.toLowerCase(Locale.ROOT).contains(query)) {
                matches << plmModelDescriptor(part)
            }
        }
        jsonResponse(matches)
    }

    def modelInfo() {
        Long id
        try { id = params.id?.toString()?.toLong() } catch (Exception ignored) { render status:400; return }
        if (!id) { render status:400; return }
        if (params.source == 'plm') {
            PlmFreeCadPart part = PlmFreeCadPart.get(id)
            if (!part || !plmFreeCadSecurityService.canDownloadFile(part)) { render status:404; return }
            jsonResponse(plmModelDescriptor(part))
        } else {
            ViewerModel m = ViewerModel.get(id)
            if (!m) { render status:404; return }
            jsonResponse([id:m.id,source:'uploaded',name:m.filename,
                url:createLink(controller:'glbViewer',action:'modelFile',id:m.id)])
        }
    }

    @Transactional
    def upload() {
        def file = request.getFile('file')
        if (!file || file.empty) { jsonResponse([error:'Select a GLB file'], 400); return }
        String name = (file.originalFilename ?: 'model.glb').replace('\\', '/').tokenize('/').last()
        if (!name.toLowerCase(Locale.ROOT).endsWith('.glb')) {
            jsonResponse([error:'Only binary .glb files are supported'], 400); return
        }
        long max = 100L * 1024L * 1024L
        if (file.size > max) { jsonResponse([error:'File exceeds 100 MB limit'], 413); return }
        String key = UUID.randomUUID().toString() + '.glb'
        Path target = storage().resolve(key)
        try {
            file.inputStream.withCloseable { input ->
                byte[] header = new byte[4]
                if (input.read(header) != 4 || !Arrays.equals(header, [0x67,0x6c,0x54,0x46] as byte[])) {
                    throw new IllegalArgumentException('Invalid GLB header')
                }
                Files.newOutputStream(target).withCloseable { output ->
                    output.write(header)
                    byte[] buf = new byte[65536]; int count
                    while ((count = input.read(buf)) != -1) output.write(buf, 0, count)
                }
            }
            ViewerModel m = new ViewerModel(filename:name, storageKey:key,
                    uploadedBy:username(), byteSize:file.size)
            if (!m.save(flush:true)) throw new IllegalStateException(m.errors.toString())
            jsonResponse([id:m.id, name:m.filename,
                url:createLink(controller:'glbViewer', action:'modelFile', id:m.id)])
        } catch (Exception ex) {
            Files.deleteIfExists(target)
            jsonResponse([error:ex.message ?: 'Upload failed'], 400)
        }
    }

    def modelFile(Long id) {
        ViewerModel m = ViewerModel.get(id)
        if (!m) { render status:404; return }
        Path file = storage().resolve(m.storageKey).normalize()
        if (!file.startsWith(storage()) || !Files.isRegularFile(file)) { render status:404; return }
        response.contentType = 'model/gltf-binary'
        response.setHeader('X-Content-Type-Options', 'nosniff')
        response.setHeader('Content-Disposition', 'inline; filename="model.glb"')
        response.contentLengthLong = Files.size(file)
        Files.copy(file, response.outputStream)
        response.outputStream.flush()
    }

    def scenes() {
        def scenes = ViewerScene.list(sort:'lastUpdated', order:'desc', max:500).findAll {
            it.shared || it.ownerUsername == username()
        }
        jsonResponse(scenes.collect { s -> [id:s.id, name:s.name, owner:s.ownerUsername,
            shared:s.shared, updated:s.lastUpdated] })
    }

    /** Toggle sharing for a saved scene. Only its owner may change visibility. */
    @Transactional
    def shareScene(Long id) {
        ViewerScene s = ViewerScene.get(id)
        if (!s) { jsonResponse([error:'Scene not found'],404); return }
        if (s.ownerUsername != username()) { jsonResponse([error:'Not authorized'],403); return }
        if (request.method != 'POST') { jsonResponse([error:'POST required'],405); return }
        s.shared = request.JSON.shared == true
        s.save(failOnError:true,flush:true)
        jsonResponse([id:s.id,shared:s.shared])
    }

    /** Delete only scenes owned by the current user. */
    @Transactional
    def deleteScene(Long id) {
        ViewerScene s = ViewerScene.get(id)
        if (!s) { jsonResponse([error:'Scene not found'],404); return }
        if (s.ownerUsername != username()) { jsonResponse([error:'Not authorized'],403); return }
        if (request.method != 'POST') { jsonResponse([error:'POST required'],405); return }
        s.delete(flush:true)
        jsonResponse([deleted:true,id:id])
    }

    def loadScene(Long id) {
        ViewerScene s = ViewerScene.get(id)
        if (!s || (!s.shared && s.ownerUsername != username())) { render status:404; return }
        jsonResponse([id:s.id, name:s.name, owner:s.ownerUsername,
            shared:s.shared, scene:new JsonSlurper().parseText(s.sceneJson)])
    }

    /** Viewer scene format v2: nodes are parts or references to separately saved scenes. */
    private Map normalizeScene(def body) {
        if (!(body instanceof Map)) throw new IllegalArgumentException('Invalid scene JSON')
        def nodes = body.nodes instanceof List ? body.nodes :
                (body.children instanceof List ? body.children : body.models)
        if (!(nodes instanceof List) || nodes.size() > 150)
            throw new IllegalArgumentException('Invalid scene nodes (max 150)')
        List result = []
        for (def n : nodes) {
            if (!(n instanceof Map)) throw new IllegalArgumentException('Invalid node')
            // CAD_TO_META exports transforms nested under transform, with quaternion [x,y,z,w].
            // Viewer scene files store the same values at the node root as rotation.
            Map placement = n.transform instanceof Map ? (Map)n.transform : [:]
            Map transform = [:]
            for (String key : ['position', 'scale']) {
                def value = n[key] instanceof List ? n[key] : placement[key]
                if (value == null) value = key == 'position' ? [0,0,0] : [1,1,1]
                if (!(value instanceof List) || value.size() != 3 ||
                    !value.every { it instanceof Number && Double.isFinite(it.doubleValue()) && Math.abs(it.doubleValue()) < 10000000 })
                    throw new IllegalArgumentException("Invalid ${key} for component '${n.name ?: 'Component'}'")
                transform[key] = value
            }
            def rotation = n.rotation instanceof List ? n.rotation :
                (n.quaternion instanceof List ? n.quaternion : placement.quaternion)
            if (rotation == null) rotation = placement.rotation instanceof List ? placement.rotation : [0,0,0,1]
            if (!(rotation instanceof List) || !(rotation.size() in [3,4]) ||
                !rotation.every { it instanceof Number && Double.isFinite(it.doubleValue()) && Math.abs(it.doubleValue()) < 10000000 } ||
                (rotation.size() == 4 && !rotation.any { Math.abs(it.doubleValue()) > 1e-12 }))
                throw new IllegalArgumentException("Invalid rotation for component '${n.name ?: 'Component'}'")
            transform.rotation = rotation
            transform.visible = n.visible != false
            transform.instanceId = (n.instanceId ?: UUID.randomUUID().toString()).toString().take(100)
            transform.name = (n.sourceFile ?: n.name ?: 'Component').toString().replace('\\','/').tokenize('/').last().take(160)
            if (n.sourceFile) transform.sourceFile = n.sourceFile.toString().take(1024)
            if (n.defaultLocation instanceof Map) transform.defaultLocation = n.defaultLocation
            if (n.type == 'assemblyReference') {
                Long assemblyId = n.assemblyId?.toString()?.toLong()
                ViewerScene child = assemblyId ? ViewerScene.get(assemblyId) : null
                if (!child || (!child.shared && child.ownerUsername != username()))
                    throw new IllegalArgumentException('Linked assembly is not accessible: ' + assemblyId)
                result << (transform + [type:'assemblyReference', assemblyId:assemblyId, versionPolicy:'latest'])
            } else {
                Long modelId = (n.partId ?: n.id)?.toString()?.toLong()
                String source = (n.source == 'plm' || n.partId != null || n.type == 'resolvedComponent') ? 'plm' : 'uploaded'
                if (!modelId && n.type != 'unresolvedComponent') throw new IllegalArgumentException('Missing part ID')
                if (source == 'plm' && modelId) {
                    PlmFreeCadPart part = PlmFreeCadPart.get(modelId)
                    if (!part || !plmFreeCadSecurityService.canDownloadFile(part))
                        throw new IllegalArgumentException('PLM part unavailable: ' + modelId)
                } else if (source != 'plm' && !ViewerModel.exists(modelId))
                    throw new IllegalArgumentException('Uploaded model record unavailable: ' + modelId)
                String geometryUnits = source == 'plm' ? (modelId ? plmUnits(PlmFreeCadPart.get(modelId)) : 'mm') : (n.geometryUnits ?: n.units ?: 'm').toString()
                if (geometryUnits && !(geometryUnits in ['mm','cm','m','in','ft']))
                    throw new IllegalArgumentException('Invalid geometry units')
                result << (transform + [type:modelId ? 'partInstance' : 'unresolvedComponent',id:modelId,source:source,
                    geometryUnits:geometryUnits,cadVersion:n.cadVersion?.toString()?.take(30)])
            }
        }
        String units = (body.units ?: 'mm').toString()
        if (!(units in ['mm','cm','m','in','ft'])) throw new IllegalArgumentException('Invalid units')
        def measurements = body.measurements instanceof List ? body.measurements : []
        if (measurements.size() > 500) throw new IllegalArgumentException('Too many measurements')
        def sections = body.sections instanceof List ? body.sections : []
        if (sections.size() > 12) throw new IllegalArgumentException('Too many sections')
        return [format:'PartsManagerAssembly',schemaVersion:2,units:units,nodes:result,
            measurements:measurements,sections:sections,camera:body.camera instanceof Map ? body.camera : [:],
            displayUnits:(body.displayUnits ?: 'mm').toString(),tree:body.tree instanceof Map ? body.tree : [:]]
    }

    @Transactional
    def saveScene() {
        def body = request.JSON
        Long id = body.id ? body.id.toString().toLong() : null
        ViewerScene s = id ? ViewerScene.get(id) : new ViewerScene(ownerUsername:username())
        if (!s || s.ownerUsername != username()) { jsonResponse([error:'Not authorized'],403); return }
        String name = body.name?.toString()?.trim()
        if (!name || name.length() > 160) { jsonResponse([error:'Scene name required (max 160 characters)'],400); return }
        try {
            Map doc = normalizeScene(body)
            String serialized = JsonOutput.toJson(doc)
            if (serialized.length() > 195000) throw new IllegalArgumentException('Scene JSON exceeds storage limit')
            s.name = name
            s.shared = body.shared == true
            s.sceneJson = serialized
            if (!s.save(flush:true)) throw new IllegalArgumentException(s.errors.toString())
            jsonResponse([id:s.id,name:s.name,shared:s.shared])
        } catch (Exception ex) { jsonResponse([error:ex.message ?: 'Invalid scene'],400) }
    }

    /** Import a standalone JSON as its own saved scene; the parent stores only its ID. */
    @Transactional
    def importScene() {
        def body = request.JSON
        String name = body.name?.toString()?.trim()
        if (!name || name.length() > 160) { jsonResponse([error:'Invalid assembly name'],400); return }
        try {
            Map doc = normalizeScene(body.scene)
            ViewerScene s = new ViewerScene(name:name,ownerUsername:username(),shared:false,
                sceneJson:JsonOutput.toJson(doc))
            if (!s.save(flush:true)) throw new IllegalArgumentException(s.errors.toString())
            jsonResponse([id:s.id,name:s.name])
        } catch (Exception ex) { jsonResponse([error:ex.message ?: 'Invalid assembly'],400) }
    }

    /** Metadata-only comparison; geometry is not silently replaced. */
    def partVersions() {
        def ids = request.JSON?.ids
        if (!(ids instanceof List) || ids.size() > 150) { jsonResponse([error:'Invalid IDs'],400); return }
        Map versions = [:]
        for (def value : ids) {
            try {
                Long id = value.toString().toLong()
                PlmFreeCadPart part = PlmFreeCadPart.get(id)
                if (part && plmFreeCadSecurityService.canDownloadFile(part)) {
                    PlmFreeCadPart latest = part
                    int depth = 0
                    while (latest.nextVersion && depth++ < 100) {
                        if (!plmFreeCadSecurityService.canDownloadFile(latest.nextVersion)) break
                        latest = latest.nextVersion
                    }
                    versions[id.toString()] = [id:latest.id,
                        version:"${latest.majorVersion ?: 1}.${latest.minorVersion ?: 0}".toString(),
                        previewAvailable:plmPreviewStorageService.modelFile(latest).isFile()]
                }
            } catch (Exception ignored) { }
        }
        jsonResponse(versions)
    }

    /** Authenticated, user-scoped queue for other modules to add a PLM part or saved assembly. */
    @Transactional
    def addToViewer() {
        def body = request.JSON
        String type = body.type?.toString()
        if (!(type in ['glb','assembly'])) { jsonResponse([error:'type must be glb or assembly'],400); return }
        Long id
        try { id = (type == 'assembly' ? body.assemblyId : body.partId).toString().toLong() }
        catch (Exception ignored) { jsonResponse([error:'Invalid ID'],400); return }
        if (type == 'assembly') {
            ViewerScene s = ViewerScene.get(id)
            if (!s || (!s.shared && s.ownerUsername != username())) { jsonResponse([error:'Assembly not accessible'],403); return }
        } else {
            PlmFreeCadPart part = PlmFreeCadPart.get(id)
            if (!part || !plmFreeCadSecurityService.canDownloadFile(part) ||
                !plmPreviewStorageService.modelFile(part).isFile()) {
                jsonResponse([error:'PLM part preview not accessible'],403); return
            }
        }
        ViewerAddRequest queued = new ViewerAddRequest(ownerUsername:username(),
            itemType:type, itemId:id, origin:(body.origin ?: 'Parts Manager').toString().take(100))
        if (!queued.save(flush:true)) { jsonResponse([error:queued.errors.toString()],400); return }
        jsonResponse([queued:true,id:queued.id])
    }

    /** Claim-once delivery; requests remain queued while viewer is closed. */
    @Transactional
    def pendingRequests() {
        String sessionId = params.sessionId?.toString()
        if (!sessionId || sessionId.length() > 100) { jsonResponse([error:'sessionId required'],400); return }
        List pending = ViewerAddRequest.findAllByOwnerUsernameAndDelivered(username(),false,
            [sort:'dateCreated',order:'asc',max:30])
        List result = []
        for (ViewerAddRequest req : pending) {
            req.delivered = true
            req.save(flush:true)
            result << (req.itemType == 'assembly' ? [type:'assembly',assemblyId:req.itemId,origin:req.origin] :
                [type:'glb',partId:req.itemId,source:'plm',origin:req.origin])
        }
        jsonResponse(result)
    }
}
