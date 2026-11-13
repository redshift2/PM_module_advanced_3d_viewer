import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const $ = id => document.getElementById('gv-'+id);

// Section-axis icon buttons mirror the existing select, preserving its change handler.
const sectionAxisButtons=()=>document.querySelectorAll('#gv-section-panel [data-axis]');
sectionAxisButtons().forEach(button=>button.addEventListener('click',()=>{
 const sel=document.getElementById('gv-section-axis');sel.value=button.dataset.axis;
 sectionAxisButtons().forEach(b=>b.classList.toggle('active',b===button));
 sel.dispatchEvent(new Event('change',{bubbles:true}));
}));
document.getElementById('gv-section-axis').addEventListener('change',event=>{
 sectionAxisButtons().forEach(b=>b.classList.toggle('active',b.dataset.axis===event.target.value));
});
document.getElementById('gv-section-disable').addEventListener('click',()=>{
 const check=document.getElementById('gv-section-enabled');check.checked=false;
 check.dispatchEvent(new Event('change',{bubbles:true}));
});

const base=$('root').dataset.base.replace(/\/index\/?$/,'').replace(/\/$/,'');
const url=action=>base+'/'+action;
const status=t=>$('status').textContent=t;
const shell=document.querySelector('.pm-shell');
const themeButton=document.getElementById('pm-theme');
const themeStorageKey='partsManagerTheme';
const storedTheme=(()=>{try{return localStorage.getItem(themeStorageKey)}catch(_){return null}})();
function setViewerTheme(theme){
 const next=theme==='light'?'light':'dark';
 shell.dataset.pmTheme=next;
 if(themeButton){themeButton.textContent=next==='dark'?'☀':'☾';themeButton.setAttribute('aria-pressed',String(next==='light'));themeButton.title=next==='dark'?'Switch to light theme':'Switch to dark theme'}
 if(typeof scene!=='undefined' && scene)scene.background=new THREE.Color(next==='dark'?0x151b25:0xeaf0f7);
}
if(themeButton)themeButton.addEventListener('click',()=>{
 const next=shell.dataset.pmTheme==='light'?'dark':'light';setViewerTheme(next);
 try{localStorage.setItem(themeStorageKey,next)}catch(_){}
});
const scene=new THREE.Scene();scene.background=new THREE.Color(0x151b25);
setViewerTheme(storedTheme==='light'?'light':'dark');
let camera=new THREE.OrthographicCamera(-5,5,5,-5,.001,1e8),perspectiveEnabled=false,spinCenter='model';
camera.position.set(5,4,7);camera.up.set(0,0,1);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;$('canvas').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x536078,2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(6,10,8);scene.add(light);
// No construction grid: keep the CAD viewport unobstructed.
const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;
const transform=new TransformControls(camera,renderer.domElement);scene.add(transform);
transform.addEventListener('dragging-changed',e=>orbit.enabled=!e.value);
transform.addEventListener('objectChange',()=>{updateFields();updateMeasures();updateSection()});
let pendingModelLoads=0;
function beginModelLoad(name){pendingModelLoads++;const overlay=document.getElementById('gv-load-overlay');overlay.hidden=false;document.getElementById('gv-load-title').textContent='Loading '+(name||'model')+'…';document.getElementById('gv-load-caption').textContent='Connecting…';const fill=document.getElementById('gv-load-fill');fill.style.width='0%';fill.classList.add('indeterminate');document.getElementById('gv-load-track').removeAttribute('aria-valuenow')}
function modelLoadProgress(event){const fill=document.getElementById('gv-load-fill'),caption=document.getElementById('gv-load-caption'),track=document.getElementById('gv-load-track');if(event.lengthComputable&&event.total>0){const percent=Math.min(100,Math.round(event.loaded/event.total*100));fill.classList.remove('indeterminate');fill.style.width=percent+'%';track.setAttribute('aria-valuenow',String(percent));caption.textContent=percent+'% downloaded'}else{fill.classList.add('indeterminate');track.removeAttribute('aria-valuenow');caption.textContent=event.loaded?((event.loaded/1048576).toFixed(1)+' MB downloaded'):'Downloading model…'}}
function endModelLoad(){pendingModelLoads=Math.max(0,pendingModelLoads-1);if(pendingModelLoads===0){document.getElementById('gv-load-overlay').hidden=true;document.getElementById('gv-load-fill').classList.remove('indeterminate')}}
async function loadModelWithProgress(url,name){beginModelLoad(name);try{return await new Promise((resolve,reject)=>loader.load(url,resolve,modelLoadProgress,reject))}finally{endModelLoad()}}
const loader=new GLTFLoader(),raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
let catalog=[],entries=[],selected=null,activeSceneId=null,measureMode=false,measureProjection="distance",measurePoints=[],measurements=[],measureMarks=[],selectionMaterials=[],unit='mm',sectionPlane=null,sectionHelper=null,sectionCapGroup=null,sectionState={enabled:false,axis:'z',position:0,reversed:false,scope:'scene',showPlane:true,cap:true,capColor:"#d94a40"},lastLoadedScene=null;
const factors={mm:1,cm:10,m:1000,in:25.4,ft:304.8};
const uuid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random();
const vector=a=>new THREE.Vector3(...(Array.isArray(a)&&a.length===3?a:[0,0,0]));
const validUnit=u=>Object.hasOwn(factors,u)?u:'mm';
function filenameLabel(value){const text=String(value||'').replace(/\\/g,'/');return text.split('/').pop()||'Unnamed model'}
function requestModelUnits(){return new Promise(resolve=>{const dialog=$('units-dialog');const done=()=>{dialog.removeEventListener('close',done);resolve(dialog.returnValue==='ok'?$('import-units').value:null)};dialog.addEventListener('close',done);dialog.showModal()})}
function captureDefaultLocation(entry){if(!entry.defaultLocation)entry.defaultLocation={position:entry.object.position.toArray(),quaternion:entry.object.quaternion.toArray(),scale:entry.object.scale.toArray()}}
function restoreLocations(){for(const entry of allEntries()){const t=entry.defaultLocation;if(!t)continue;entry.object.position.fromArray(t.position);entry.object.quaternion.fromArray(t.quaternion);entry.object.scale.fromArray(t.scale)}updateFields();updateMeasures();updateSection();renderObjects();status('All model locations restored to their initial loaded positions')}

const number=(n,d=0)=>Number.isFinite(Number(n))?Number(n):d;
function resize(){const w=Math.max(1,$('canvas').clientWidth),h=Math.max(1,$('canvas').clientHeight);renderer.setSize(w,h);if(camera.isPerspectiveCamera)camera.aspect=w/h;else{const height=camera.top-camera.bottom;camera.left=-height*w/h/2;camera.right=height*w/h/2}camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe($('canvas'));resize();
// A camera-relative XYZ triad fixed to the viewport's upper-right corner.
const orientationCanvas=document.getElementById('gv-orientation');
const orientationCtx=orientationCanvas.getContext('2d');
function drawOrientation(){
 const ctx=orientationCtx, w=orientationCanvas.width,h=orientationCanvas.height;ctx.clearRect(0,0,w,h);
 const center={x:w/2,y:h/2+7},axes=[['X',new THREE.Vector3(1,0,0),'#ff4444'],['Y',new THREE.Vector3(0,1,0),'#66e43d'],['Z',new THREE.Vector3(0,0,1),'#529dff']];
 const inv=camera.quaternion.clone().invert();
 const lines=axes.map(([label,axis,color])=>{const p=axis.applyQuaternion(inv);return {label,color,x:center.x+p.x*43,y:center.y-p.y*43,z:p.z}}).sort((a,b)=>a.z-b.z);
 for(const p of lines){ctx.strokeStyle=p.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(center.x,center.y);ctx.lineTo(p.x,p.y);ctx.stroke();const dx=p.x-center.x,dy=p.y-center.y,len=Math.hypot(dx,dy)||1;const ux=dx/len,uy=dy/len;ctx.fillStyle=p.color;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-ux*12-uy*5,p.y-uy*12+ux*5);ctx.lineTo(p.x-ux*12+uy*5,p.y-uy*12-ux*5);ctx.closePath();ctx.fill();ctx.font='bold 16px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.strokeStyle='#0a1527';ctx.lineWidth=3;ctx.strokeText(p.label,p.x+ux*13,p.y+uy*13);ctx.fillStyle=p.color;ctx.fillText(p.label,p.x+ux*13,p.y+uy*13)}
}
const fullscreenButton=$('fullscreen'),viewerElement=$('view');
fullscreenButton.addEventListener('click',async()=>{try{if(document.fullscreenElement===viewerElement)await document.exitFullscreen();else await viewerElement.requestFullscreen()}catch(e){status('Full screen unavailable: '+e.message)}});
document.addEventListener('fullscreenchange',()=>{const active=document.fullscreenElement===viewerElement;fullscreenButton.textContent=active?'⤢':'⛶';fullscreenButton.title=active?'Exit full screen':'Full-screen 3D view';fullscreenButton.setAttribute('aria-pressed',String(active));requestAnimationFrame(resize)});
function animate(){requestAnimationFrame(animate);orbit.update();drawOrientation();renderer.render(scene,camera)}animate();
async function api(action,options){const r=await fetch(url(action),{credentials:'same-origin',...options});const txt=await r.text();let data;try{data=JSON.parse(txt)}catch{throw Error('Unexpected server response for '+action)}if(!r.ok)throw Error(data.error||'Request failed');return data}
async function refresh(){const scenes=await api('scenes');const current=$('scenes').value;$('scenes').replaceChildren(...scenes.map(s=>new Option(s.name+' — '+s.owner+(s.shared?' (shared)':''),s.id)));if(current)$('scenes').value=current;status('Lists refreshed')}
async function findModel(id,source){const list=await api(source==='plm'?'plmModels':'models');const found=list.find(x=>String(x.id)===String(id));if(found)return {...found,source};return api('modelInfo?source='+encodeURIComponent(source)+'&id='+encodeURIComponent(id))}
function clearHighlight(){for(const [mesh,materials] of selectionMaterials){mesh.material=materials}selectionMaterials=[]}
function highlight(entry){clearHighlight();if(!entry)return;entry.object.traverse(node=>{if(!node.isMesh)return;selectionMaterials.push([node,node.material]);const highlightMat=mat=>{const m=mat.clone();if(m.emissive){m.emissive.setHex(0xff2020);m.emissiveIntensity=.7}else m.color?.lerp(new THREE.Color(0xff2020),.7);return m};node.material=Array.isArray(node.material)?node.material.map(highlightMat):highlightMat(node.material)})}
function select(entry){clearHighlight();selected=entry;transform.detach();if(entry&&entry.object.visible){if($('move').classList.contains('active')||$('rotate').classList.contains('active')||$('scale').classList.contains('active'))transform.attach(entry.object);highlight(entry)}if(spinCenter==='selected'&&entry)applySpinPivot();updateFields();renderObjects();updateSection();updateDeleteButtons()}
function updateFields(){$('selected').textContent=selected?selected.name:'None selected';for(const [id,prop,mul] of [['pos','position',1],['rot','rotation',180/Math.PI],['scale-values','scale',1]])$(''+id).querySelectorAll('input').forEach((input,i)=>{input.value=selected?+(selected.object[prop].toArray()[i]*mul).toFixed(5):'';input.disabled=!selected})}
for(const [id,prop,mul] of [['pos','position',1],['rot','rotation',Math.PI/180],['scale-values','scale',1]])$(id).querySelectorAll('input').forEach((input,i)=>input.addEventListener('change',()=>{if(!selected)return;const n=Number(input.value);if(!Number.isFinite(n)||Math.abs(n)>1e7)return updateFields();selected.object[prop].setComponent(i,n*mul);updateFields();updateMeasures();updateSection()}));
function transformOf(e){return {position:e.object.position.toArray(),rotation:e.object.quaternion.toArray(),scale:e.object.scale.toArray(),visible:e.object.visible}}
function applyTransform(object,data){if(!data)return;const pos=data.position;if(Array.isArray(pos)&&pos.length===3)object.position.fromArray(pos);if(Array.isArray(data.rotation)&&data.rotation.length===4)object.quaternion.fromArray(data.rotation);else if(Array.isArray(data.rotation)&&data.rotation.length>=3)object.rotation.fromArray(data.rotation.slice(0,3));if(Array.isArray(data.scale)&&data.scale.length===3)object.scale.fromArray(data.scale);object.visible=data.visible!==false}
function renderObjects(){
 const tree=$('tree');tree.replaceChildren();
 const eyeSvg=visible=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="'+(visible?'#bcdcff':'none')+'" stroke="#8cc4ff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.3" fill="#1b528c"/>'+(visible?'':'<path d="M3 21 21 3" stroke="#f1b9b9" stroke-width="2"/>')+'</svg>';
 function draw(entry,parent,depth=0){
  const row=document.createElement('div');row.className='gv-tree-row'+(entry===selected?' is-selected':'');row.style.marginLeft=(depth*19)+'px';if(entry===selected){row.style.backgroundColor='rgba(220,38,38,.24)';row.style.outline='1px solid #ef4444';row.style.borderRadius='4px'}row.setAttribute('role','treeitem');row.setAttribute('aria-selected',String(entry===selected));
  if(entry.kind==='assembly'){
   const exp=document.createElement('button');exp.type='button';exp.className='gv-expander';exp.textContent=entry.treeCollapsed?'▸':'▾';exp.title=entry.treeCollapsed?'Expand assembly':'Collapse assembly';exp.onclick=()=>{entry.treeCollapsed=!entry.treeCollapsed;renderObjects()};row.append(exp);
  }else{const spacer=document.createElement('span');spacer.className='gv-expander-spacer';row.append(spacer)}
  const eye=document.createElement('button');eye.className='gv-eye';eye.type='button';eye.innerHTML=eyeSvg(entry.object.visible);eye.title=entry.object.visible?'Hide':'Show';eye.setAttribute('aria-label',eye.title+' '+entry.name);eye.onclick=()=>{entry.object.visible=!entry.object.visible;renderObjects();updateSection()};row.append(eye);
  if(entry.missingGeometry){const missing=document.createElement('span');missing.textContent='✖';missing.style.cssText='color:#e33434;font-weight:900;font-size:17px;line-height:1';missing.title='Missing ASMJ/GLB: '+(entry.error||'File unavailable');row.append(missing)}
  const icon=document.createElement('span');icon.className='gv-part-icon';icon.innerHTML=entry.kind==='assembly'?'<svg viewBox="0 0 24 24"><path d="M12 2v7M12 9 4 15M12 9l8 6" stroke="#b6d8ff" stroke-width="2"/><rect x="8" y="1" width="8" height="7" fill="#70d1e3" stroke="#1d508c"/><rect x="1" y="15" width="8" height="7" fill="#f0d65d" stroke="#7b650e"/><rect x="15" y="15" width="8" height="7" fill="#f0d65d" stroke="#7b650e"/></svg>':'<svg viewBox="0 0 24 24"><path d="m12 2 10 5v11l-10 5-10-5V7z" fill="#c5d3e4" stroke="#54677f"/><path d="m2 7 10 5 10-5M12 12v11" fill="none" stroke="#54677f"/></svg>';row.append(icon);
  const name=document.createElement('button');name.type='button';name.className='gv-part-name'+(entry.kind==='assembly'?' gv-link':'');name.textContent=entry.name;if(entry===selected){name.style.color='#ff4b4b';name.style.fontWeight='700'}name.title=entry.missingGeometry?'Missing ASMJ/GLB: '+(entry.error||'File unavailable'):(entry.kind==='assembly'?'Linked assembly: '+entry.name:'Select '+entry.name);name.onclick=()=>select(entry);name.ondblclick=()=>focusEntry(entry);row.append(name);
  if(entry.kind==='assembly'){const link=document.createElement('span');link.className='gv-link-indicator';link.title='Linked assembly';link.textContent='🔗';row.append(link)}
  if(entry.cadVersion){const v=document.createElement('span');v.className='gv-part-version';v.textContent='v'+entry.cadVersion;row.append(v)}
  if(entry.updateAvailable){const up=document.createElement('span');up.className='gv-update-available';up.title='Newer version available';up.textContent='⬆';row.append(up)}
  parent.append(row);
  if(entry.kind==='assembly'&&!entry.treeCollapsed){if(entry.error){const err=document.createElement('div');err.className='gv-tree-error';err.style.marginLeft=((depth+1)*19)+'px';err.textContent='⚠ '+entry.error;parent.append(err)}for(const child of entry.children||[])draw(child,parent,depth+1)}
 }
 for(const entry of entries)draw(entry,tree)
}
// Recursively resolve PLM assemblies. Each occurrence owns its own transform and tree node.
async function addPart(data,parent=null,partStack=[]){
 const source=data.source==='plm'?'plm':'uploaded';
 const placement=new THREE.Group();placement.name=data.name||'Part';applyTransform(placement,data);
 (parent?parent.object:scene).add(placement);
 const entry={kind:'part',instanceId:data.instanceId||uuid(),id:data.id,source,
  name:filenameLabel(data.sourceFile||data.filename||data.name||'Part'),object:placement,geometryUnits:validUnit(data.geometryUnits||(source==='plm'?'mm':'m')),
  cadVersion:data.cadVersion||null,children:[],missingGeometry:false,error:null};
 (parent?parent.children:entries).push(entry);
 try{
  if(source==='plm'&&partStack.map(String).includes(String(data.id)))
   throw Error('Circular PLM assembly reference: '+[...partStack,data.id].join(' → '));
  if(partStack.length>=24)throw Error('PLM assembly nesting limit reached');
  if(source==='plm'&&(!data.id||!Number.isSafeInteger(Number(data.id))))throw Error('Unresolved PLM component ID');
  const m=await findModel(data.id,source);
  entry.id=m.id;entry.cadVersion=m.cadVersion||entry.cadVersion;entry.name=filenameLabel(data.sourceFile||m.filename||m.name||entry.name);
  if(m.format==='missing')throw Error('Neither ASMJ nor GLB is available');
  if(m.format==='asmj'){
   entry.kind='assembly';
   const response=await fetch(m.url,{credentials:'same-origin',cache:'no-store'});
   if(!response.ok)throw Error('ASMJ download failed (HTTP '+response.status+')');
   const doc=await response.json();
   if(doc.format!=='PartsManagerAssembly'||!Array.isArray(doc.nodes))throw Error('Invalid ASMJ document');
   const sceneUnit=validUnit(doc.units||doc.lengthUnit||'mm');
   const nextStack=[...partStack,Number(data.id)];
   for(const n of doc.nodes){
    const t=n.transform||{};
    const child=await addPart({id:n.partId??n.id,source:'plm',name:filenameLabel(n.sourceFile||n.name||n.label||'Unresolved component'),sourceFile:n.sourceFile,
     position:n.position||t.position,rotation:n.rotation||t.quaternion,scale:n.scale||t.scale,
     parentUnits:sceneUnit},entry,nextStack);
    child.object.position.multiplyScalar(factors[sceneUnit]/factors.mm);captureDefaultLocation(child);
   }
  }else{
   if(!m.url)throw Error('GLB file unavailable');
   const gltf=await loadModelWithProgress(m.url,data.name||m.name);
   const object=gltf.scene;object.userData.viewerEntry=true;
   const rawUnits=source==='plm'?(m.geometryUnits||data.geometryUnits):(data.geometryUnits||data.units);const native=rawUnits&&Object.hasOwn(factors,rawUnits)?rawUnits:await requestModelUnits();if(!native)throw Error('Model units were not selected');
   const parentUnit=validUnit(data.parentUnits||'mm');
   object.scale.multiplyScalar(factors[native]/factors[parentUnit]);
   placement.add(object);entry.geometryUnits=native;
  }
 }catch(error){
  entry.missingGeometry=true;entry.error=error?.message||'ASMJ/GLB unavailable';
  console.warn('Unable to load',entry.name,entry.id,entry.error);
 }
 if(data.defaultLocation)entry.defaultLocation=data.defaultLocation;captureDefaultLocation(entry);if(data.color)applyPartColor(entry,data.color);renderObjects();select(entry);return entry;
}
async function addAssemblyReference(data,parent=null,stack=[]){const id=Number(data.assemblyId);if(!Number.isSafeInteger(id)||id<=0)throw Error('Linked assembly requires a saved scene ID');if(stack.includes(id))throw Error('Circular assembly reference: '+[...stack,id].join(' → '));if(stack.length>12)throw Error('Assembly nesting limit reached');const container=new THREE.Group();applyTransform(container,data);(parent?parent.object:scene).add(container);const entry={kind:'assembly',instanceId:data.instanceId||uuid(),assemblyId:id,name:filenameLabel(data.name||'Linked Assembly #'+id),object:container,children:[],units:validUnit(data.units||'mm'),error:null};(parent?parent.children:entries).push(entry);try{const loaded=await api('loadScene/'+id);entry.name=filenameLabel(data.name||loaded.name);await buildNodes(loaded.scene,entry,[...stack,id])}catch(e){entry.error=e.message}renderObjects();return entry}
async function buildNodes(doc,parent=null,stack=[]){const sceneUnit=validUnit(doc.units||'mm');const nodes=Array.isArray(doc.nodes)?doc.nodes:Array.isArray(doc.children)?doc.children:(doc.models||[]).map(m=>({...m,type:'partInstance'}));for(const n of nodes){if(n.type==='assemblyReference'){const child=await addAssemblyReference(n,parent,stack);child.object.position.multiplyScalar(factors[sceneUnit]/factors.mm);captureDefaultLocation(child)}else if(n.type==='partInstance'||n.type==='resolvedComponent'||n.type==='unresolvedComponent'||!n.type){const entry=await addPart({...n,id:n.partId??n.id,source:n.partId!=null||n.type==='unresolvedComponent'?'plm':n.source,sourceFile:n.sourceFile,rotation:n.rotation||n.transform?.quaternion,position:n.position||n.transform?.position,scale:n.scale||n.transform?.scale,parentUnits:sceneUnit,color:n.color},parent);entry.object.position.multiplyScalar(factors[sceneUnit]/factors.mm);captureDefaultLocation(entry);}}renderObjects()}
function allEntries(){const out=[];const walk=arr=>arr.forEach(e=>{out.push(e);walk(e.children||[])});walk(entries);return out}
function clearScene(){clearNotes();sceneCreator=null;clearHighlight();transform.detach();selected=null;entries.forEach(e=>scene.remove(e.object));entries=[];clearMeasures();updateSection();renderObjects()}
function visibleBounds(){const box=new THREE.Box3();entries.filter(e=>e.object.visible).forEach(e=>box.expandByObject(e.object));return box.isEmpty()?null:box}
function pivotForMode(){if(spinCenter==='view')return orbit.target.clone();if(spinCenter==='selected'&&selected)return new THREE.Box3().setFromObject(selected.object).getCenter(new THREE.Vector3());const box=visibleBounds();return box?box.getCenter(new THREE.Vector3()):orbit.target.clone()}
function applySpinPivot(){const pivot=pivotForMode(),offset=camera.position.clone().sub(orbit.target);orbit.target.copy(pivot);camera.position.copy(pivot).add(offset);orbit.update()}
function fit(){
 const box=new THREE.Box3();let count=0;
 for(const e of allEntries()){if(e.kind!=='part'||e.missingGeometry||!e.object.visible)continue;e.object.updateWorldMatrix(true,true);e.object.traverse(o=>{if(!o.isMesh||!o.visible||!o.geometry)return;o.geometry.computeBoundingBox();if(!o.geometry.boundingBox)return;const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);if(!b.isEmpty()&&[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].every(Number.isFinite)){box.union(b);count++}})}
 if(!count||box.isEmpty()){status('Fit All: no visible geometry');return}
 const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),radius=Math.max(size.length()/2,.001),aspect=Math.max(1,$('canvas').clientWidth)/Math.max(1,$('canvas').clientHeight);
 const direction=camera.position.clone().sub(orbit.target).normalize();if(direction.lengthSq()<.5)direction.set(1,1,1).normalize();
 const verticalFov=camera.isPerspectiveCamera?THREE.MathUtils.degToRad(camera.fov):THREE.MathUtils.degToRad(55);
 const horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*aspect);
 const distance=radius/Math.sin(Math.min(verticalFov,horizontalFov)/2)*1.25;
 orbit.target.copy(center);camera.position.copy(center).addScaledVector(direction,distance);
 camera.near=Math.max(.00001,distance-radius*2);camera.far=Math.max(distance+radius*4,camera.near*10);
 if(camera.isOrthographicCamera){const halfHeight=Math.max(radius*1.35,radius*1.35/aspect);camera.top=halfHeight;camera.bottom=-halfHeight;camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.zoom=1}
 resize();camera.updateProjectionMatrix();orbit.update();status('Fit All: '+count+' visible meshes')
}
function focusEntry(e){const box=new THREE.Box3().setFromObject(e.object);if(box.isEmpty())return;const center=box.getCenter(new THREE.Vector3()),delta=center.clone().sub(orbit.target);orbit.target.copy(center);camera.position.add(delta);orbit.update()}
function switchProjection(enabled){if(perspectiveEnabled===enabled)return;const old=camera,distance=Math.max(old.position.distanceTo(orbit.target),.001),aspect=Math.max(1,$('canvas').clientWidth)/Math.max(1,$('canvas').clientHeight);let next;if(enabled)next=new THREE.PerspectiveCamera(55,aspect,old.near,old.far);else{const height=old.isPerspectiveCamera?2*distance*Math.tan(THREE.MathUtils.degToRad(55/2)):old.top-old.bottom;next=new THREE.OrthographicCamera(-height*aspect/2,height*aspect/2,height/2,-height/2,old.near,old.far)}next.position.copy(old.position);next.quaternion.copy(old.quaternion);next.up.copy(old.up);camera=next;orbit.object=camera;transform.camera=camera;perspectiveEnabled=enabled;$('perspective').classList.toggle('active',enabled);$('perspective').setAttribute('aria-pressed',String(enabled));$('perspective').title=enabled?'Switch to orthographic':'Switch to perspective';resize();orbit.update()}
function setSpinCenter(mode){spinCenter=mode;for(const name of ['model','view','selected']){$('spin-'+name).classList.toggle('active',mode===name);$('spin-'+name).setAttribute('aria-pressed',String(mode===name))}if(mode!=='view')applySpinPivot()}
function standardView(name){if(name==='home')return fit();const dirs={front:[0,-1,0],back:[0,1,0],left:[-1,0,0],right:[1,0,0],top:[0,0,1],bottom:[0,0,-1],iso:[1,-1,1]};const center=pivotForMode(),distance=Math.max(camera.position.distanceTo(orbit.target),1);orbit.target.copy(center);camera.up.set(0,0,1);if(['top','bottom'].includes(name))camera.up.set(0,1,0);camera.position.copy(center).addScaledVector(vector(dirs[name]).normalize(),distance);camera.lookAt(center);orbit.update()}
for(const name of ['front','back','left','right','top','bottom','iso'])$(name).onclick=()=>standardView(name);
for(const name of ['model','view','selected'])$('spin-'+name).onclick=()=>setSpinCenter(name);
$('perspective').onclick=()=>switchProjection(!perspectiveEnabled);
function clearMeasureGraphics(){for(const mark of measureMarks){scene.remove(mark);mark.traverse?.(o=>{o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose()})}measureMarks=[]}
function marker(p,color){const mesh=new THREE.Mesh(new THREE.SphereGeometry(Math.max((visibleBounds()?.getSize(new THREE.Vector3()).length()||100)/500,.1),12,8),new THREE.MeshBasicMaterial({color,depthTest:false}));mesh.position.copy(p);mesh.renderOrder=998;scene.add(mesh);measureMarks.push(mesh)}
function dimension(a,b,color,label){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color,depthTest:false}));line.renderOrder=998;scene.add(line);measureMarks.push(line);const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.font='bold 48px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=8;ctx.strokeStyle='#111';ctx.strokeText(label,256,64);ctx.fillStyle='#'+new THREE.Color(color).getHexString();ctx.fillText(label,256,64);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:false}));sprite.position.copy(a).add(b).multiplyScalar(.5);const size=Math.max((visibleBounds()?.getSize(new THREE.Vector3()).length()||100)*.19,10);sprite.scale.set(size,size*.25,1);sprite.renderOrder=999;scene.add(sprite);measureMarks.push(sprite)}
function measurementPoint(ref){const e=allEntries().find(x=>x.instanceId===ref.instanceId);return e?e.object.localToWorld(vector(ref.local)):vector(ref.world)}
function formatDistance(mm){return (mm/factors[unit]).toFixed(unit==='in'||unit==='ft'?3:2)+' '+unit}
function updateMeasures(){clearMeasureGraphics();const panel=$('measure-panel');panel.replaceChildren();for(const m of measurements){const a=measurementPoint(m.a),b=measurementPoint(m.b);marker(a,0xffe16b);marker(b,0xffe16b);const delta=b.clone().sub(a);const mode=m.projection||'distance';if(mode==='distance'||mode==='xyz')dimension(a,b,0xffe16b,formatDistance(delta.length()));const projections={x:[delta.x,0,0],y:[0,delta.y,0],z:[0,0,delta.z]};const colors={x:0xff4545,y:0x62ee54,z:0x4d8fff};const names=mode==='xyz'?['x','y','z']:['x','y','z'].includes(mode)?[mode]:[];let cursor=a.clone();for(const axis of names){const next=cursor.clone().add(vector(projections[axis]));dimension(cursor,next,colors[axis],axis.toUpperCase()+' '+formatDistance(Math.abs(delta[axis])));cursor=next}const row=document.createElement('div');row.textContent='📐 '+formatDistance(delta.length())+(mode!=='distance'?'  ΔX '+formatDistance(delta.x)+' ΔY '+formatDistance(delta.y)+' ΔZ '+formatDistance(delta.z):'');panel.append(row)}}
function clearMeasures(){measurePoints=[];measurements=[];clearMeasureGraphics();$('measure-panel').replaceChildren()}
function measure(hit){let root=hit.object;while(root.parent&&!root.userData.viewerEntry)root=root.parent;const e=allEntries().find(x=>x.object===root||root.parent===x.object||x.object.getObjectById(root.id));const local=e?e.object.worldToLocal(hit.point.clone()).toArray():hit.point.toArray();measurePoints.push({instanceId:e?.instanceId||null,local,world:hit.point.toArray()});if(measurePoints.length===2){measurements.push({id:uuid(),a:measurePoints[0],b:measurePoints[1],projection:measureProjection});measurePoints=[];updateMeasures();status('Measurement added; save the scene to keep it')}}
renderer.domElement.addEventListener('pointerdown',event=>{if(event.button!==0||transform.dragging)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(entries.filter(e=>e.object.visible).map(e=>e.object),true).filter(h=>h.object.isMesh);if(!hits.length){if(!measureMode)select(null);return}if(measureMode){measure(hits[0]);return}const hit=hits[0].object;const match=allEntries().filter(e=>e.object===hit||e.object.getObjectById(hit.id)).sort((a,b)=>b.object.getWorldPosition(new THREE.Vector3()).length()-a.object.getWorldPosition(new THREE.Vector3()).length());select(match.find(e=>e.kind==='part')||match[0]||null)});
function mode(which){
 measureMode=which==='measure';
 const selecting=which==='select';
 if(!measureMode&&!selecting)transform.setMode(which);
 for(const name of ['select','move','rotate','scale','measure']){
  const active=name===(selecting?'select':measureMode?'measure':which==='translate'?'move':which);
  $(name).classList.toggle('active',active);$(name).setAttribute('aria-pressed',String(active));
 }
 transform.enabled=!measureMode&&!selecting;
 if(selecting||measureMode)transform.detach();else if(selected)transform.attach(selected.object);
}
function chooseMeasurementProjection(value){
 measureProjection=value;
 document.querySelectorAll('#gv-measure-dialog [data-measure]').forEach(button=>{
  const active=button.dataset.measure===value;
  button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
 });
}
document.querySelectorAll('#gv-measure-dialog [data-measure]').forEach(button=>button.addEventListener('click',()=>chooseMeasurementProjection(button.dataset.measure)));
$('select').onclick=()=>mode('select');
$('move').onclick=()=>mode('translate');$('rotate').onclick=()=>mode('rotate');$('scale').onclick=()=>mode('scale');
$('measure').onclick=()=>{mode('measure');$('measure-dialog').hidden=false};
$('measure-close').onclick=()=>{$('measure-dialog').hidden=true;mode('select')};
$('measure-done').onclick=()=>{$('measure-dialog').hidden=true;mode('select')};
$('measure-clear').onclick=clearMeasures;

mode('select');
function sectionConfig(){sectionState={enabled:$('section-enabled').checked,axis:$('section-axis').value,position:number($('section-position').value),rotation:number($('section-rotation').value),reversed:$('section-reverse').checked,scope:$('section-scope').value,showPlane:$('section-show-plane').checked,cap:$('section-cap').checked,capColor:$('section-cap-color').value};return sectionState}
// Solid section caps: intersect actual triangles with the cutting plane,
// connect edges into closed rings, and triangulate outer rings with holes.
// Unlike stencil-plane painting, this never colors empty areas outside a cut.
function disposeSectionCaps(){
 if(!sectionCapGroup)return;
 scene.remove(sectionCapGroup);
 sectionCapGroup.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())});
 sectionCapGroup=null;
}
function sectionTarget(entry){return sectionState.scope==='scene'||!!(selected&&(entry===selected||selected.object.getObjectById(entry.object.id)))}
function capGeometryForMesh(mesh,normal,offset){
 const geometry=mesh.geometry,position=geometry?.getAttribute('position');
 if(!position||position.count<3)return null;
 const index=geometry.getIndex(),triangles=index?index.count:position.count;
 const matrix=mesh.matrixWorld;
 const origin=normal.clone().multiplyScalar(offset);
 const tangent=new THREE.Vector3().crossVectors(normal,Math.abs(normal.z)<.9?new THREE.Vector3(0,0,1):new THREE.Vector3(0,1,0)).normalize();
 const bitangent=new THREE.Vector3().crossVectors(normal,tangent).normalize();
 const world=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 const to2=p=>new THREE.Vector2(p.clone().sub(origin).dot(tangent),p.clone().sub(origin).dot(bitangent));
 const box=new THREE.Box3().setFromObject(mesh),size=Math.max(box.getSize(new THREE.Vector3()).length(),1);
 const eps=Math.max(size*1e-7,1e-7),quant=Math.max(size*1e-5,1e-5);
 const points=new Map(),edges=[];
 const key=p=>Math.round(p.x/quant)+','+Math.round(p.y/quant);
 const add=(p,q)=>{const u=to2(p),v=to2(q),ku=key(u),kv=key(v);if(ku===kv)return;points.set(ku,u);points.set(kv,v);edges.push([ku,kv])};
 const vertex=(i,out)=>out.fromBufferAttribute(position,i).applyMatrix4(matrix);
 for(let i=0;i+2<triangles;i+=3){
  vertex(index?index.getX(i):i,a);vertex(index?index.getX(i+1):i+1,b);vertex(index?index.getX(i+2):i+2,c);
  const verts=[a,b,c],dist=verts.map(p=>normal.dot(p)-offset),hits=[];
  for(let k=0;k<3;k++){
   const j=(k+1)%3,d=dist[k],e=dist[j];
   if((d>eps&&e< -eps)||(d< -eps&&e>eps))hits.push(verts[k].clone().lerp(verts[j],d/(d-e)));
   else if(Math.abs(d)<=eps&&Math.abs(e)>eps)hits.push(verts[k].clone());
  }
  if(hits.length===2)add(hits[0],hits[1]);
 }
 if(!edges.length)return null;
 // Every vertex on a closed manifold has two incident section edges.
 const adjacency=new Map();edges.forEach(([u,v],i)=>{for(const k of [u,v]){if(!adjacency.has(k))adjacency.set(k,[]);adjacency.get(k).push(i)}});
 const used=new Set(),rings=[];
 for(let i=0;i<edges.length;i++){
  if(used.has(i))continue;
  const first=edges[i][0];let current=first,previous=null;const ring=[];
  for(let steps=0;steps<=edges.length;steps++){
   ring.push(current);const options=(adjacency.get(current)||[]).filter(id=>!used.has(id));
   if(!options.length)break;
   const nextEdge=options.find(id=>edges[id][0]!==previous&&edges[id][1]!==previous)??options[0];
   used.add(nextEdge);const [u,v]=edges[nextEdge],next=u===current?v:u;
   previous=current;current=next;if(current===first){if(ring.length>=3)rings.push(ring.map(k=>points.get(k)));break}
  }
 }
 if(!rings.length)return null;
 const signedArea=ring=>ring.reduce((sum,p,i)=>{const q=ring[(i+1)%ring.length];return sum+p.x*q.y-q.x*p.y},0)/2;
 const contains=(ring,p)=>{let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const a=ring[i],b=ring[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }return inside};
 const loops=rings.map(r=>({ring:r,area:Math.abs(signedArea(r)),parent:-1,depth:0})).filter(r=>r.area>quant*quant);
 loops.forEach((loop,i)=>{let best=Infinity;loops.forEach((other,j)=>{if(i!==j&&other.area>loop.area&&other.area<best&&contains(other.ring,loop.ring[0])){loop.parent=j;best=other.area}})});
 const depth=i=>{let n=0,seen=new Set();while(loops[i].parent>=0&&!seen.has(i)){seen.add(i);i=loops[i].parent;n++}return n};
 loops.forEach((l,i)=>l.depth=depth(i));
 const xyz=[];
 for(let i=0;i<loops.length;i++){
  const outer=loops[i];if(outer.depth%2)continue;
  const holes=loops.filter(h=>h.parent===i&&h.depth%2===1).map(h=>h.ring);
  // Three.ShapeUtils uses Earcut and preserves holes inside solid outlines.
  const tris=THREE.ShapeUtils.triangulateShape(outer.ring,holes),vertices=[...outer.ring,...holes.flat()];
  for(const tri of tris)for(const idx of tri){const p=vertices[idx];world.copy(origin).addScaledVector(tangent,p.x).addScaledVector(bitangent,p.y);xyz.push(world.x,world.y,world.z)}
 }
 if(!xyz.length)return null;
 const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(xyz,3));result.computeVertexNormals();return result;
}
function buildSectionCaps(normal,offset){
 disposeSectionCaps();if(!sectionState.enabled||!sectionState.cap)return;
 const group=new THREE.Group();let total=0;
 for(const entry of allEntries()){
  if(entry.kind!=='part'||!sectionTarget(entry)||!entry.object.visible)continue;
  entry.object.updateWorldMatrix(true,true);
  entry.object.traverse(mesh=>{
   if(!mesh.isMesh||!mesh.visible||!mesh.geometry)return;
   const geometry=capGeometryForMesh(mesh,normal,offset);if(!geometry)return;
   const material=new THREE.MeshBasicMaterial({color:sectionState.capColor,side:THREE.DoubleSide,depthWrite:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
   const cap=new THREE.Mesh(geometry,material);cap.renderOrder=3;group.add(cap);total++;
  });
 }
 if(total){scene.add(group);sectionCapGroup=group}
}
function updateSection(){disposeSectionCaps();const s=sectionConfig();if(sectionHelper){scene.remove(sectionHelper);sectionHelper.geometry.dispose();sectionHelper.material.dispose();sectionHelper=null}renderer.localClippingEnabled=s.enabled;const baseAxis=vector(s.axis==='x'?[1,0,0]:s.axis==='y'?[0,1,0]:[0,0,1]);const rotationAxis=vector(s.axis==='x'?[0,1,0]:s.axis==='y'?[0,0,1]:[1,0,0]);const direction=baseAxis.clone().applyAxisAngle(rotationAxis,THREE.MathUtils.degToRad(s.rotation||0)).multiplyScalar(s.reversed?-1:1);const planeOrigin=baseAxis.clone().multiplyScalar(s.position);sectionPlane=new THREE.Plane(direction,-direction.dot(planeOrigin));for(const e of allEntries())if(e.kind==='part')e.object.traverse(node=>{if(!node.isMesh)return;const target=s.scope==='scene'||(selected&&(e===selected||selected.object.getObjectById(e.object.id)));const mats=Array.isArray(node.material)?node.material:[node.material];for(const mat of mats){mat.clippingPlanes=s.enabled&&target?[sectionPlane]:[];mat.clipShadows=true;mat.side=THREE.DoubleSide;mat.needsUpdate=true}});if(s.enabled&&s.showPlane){const size=Math.max(visibleBounds()?.getSize(new THREE.Vector3()).length()||100,100);sectionHelper=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({color:0x2688ff,transparent:true,opacity:.19,side:THREE.DoubleSide,depthWrite:false}));sectionHelper.position.copy(planeOrigin);sectionHelper.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction);scene.add(sectionHelper)}if(s.enabled&&s.cap)buildSectionCaps(direction,direction.dot(planeOrigin))}
$('section').onclick=()=>{$('section-panel').hidden=!$('section-panel').hidden};$('section-close').onclick=()=>{$('section-panel').hidden=true};for(const id of ['section-enabled','section-axis','section-position','section-rotation','section-reverse','section-scope','section-show-plane','section-cap','section-cap-color'])$(id).addEventListener('input',()=>{if(id==='section-position')$('section-slider').value=$('section-position').value;if(id==='section-rotation')$('section-rotation-label').textContent=$('section-rotation').value+'°';updateSection()});$('section-slider').oninput=()=>{$('section-position').value=$('section-slider').value;updateSection()};$('section-reset').onclick=()=>{$('section-enabled').checked=false;$('section-position').value=0;$('section-slider').value=0;$('section-rotation').value=0;$('section-rotation-label').textContent='0°';updateSection()};
// PLM part picker: results, selection and preview are separate from scene mutation.
let partSearchResults=[],chosenPart=null,partSearchSerial=0;
function choosePlmPart(part){chosenPart=part;const tbody=$('part-results');for(const row of tbody.children)row.setAttribute('aria-selected',String(row.dataset.id===String(part.id)));$('part-confirm').disabled=false;
 $('part-details').replaceChildren();for(const [label,value] of [['Part ID',part.id],['Name',part.filename||part.name],['CAD Version',part.cadVersion?'v'+part.cadVersion:'Unknown'],['Lifecycle State',part.lifecycleState||'Unknown']]){const div=document.createElement('div');div.textContent=label+': '+value;$('part-details').append(div)}
 const img=$('part-thumbnail');img.hidden=true;img.removeAttribute('src');$('part-no-thumbnail').hidden=false;$('part-no-thumbnail').textContent='Loading thumbnail…';if(part.thumbnailUrl){img.onload=()=>{if(chosenPart!==part)return;img.hidden=false;$('part-no-thumbnail').hidden=true};img.onerror=()=>{if(chosenPart!==part)return;img.hidden=true;$('part-no-thumbnail').hidden=false;$('part-no-thumbnail').textContent='No thumbnail available'};img.src=part.thumbnailUrl}else $('part-no-thumbnail').textContent='No thumbnail available';}
async function searchPlmParts(){const serial=++partSearchSerial;const query=$('part-query').value.trim();$('part-empty').hidden=false;$('part-empty').textContent='Searching…';$('part-results').replaceChildren();$('part-count').textContent='';chosenPart=null;$('part-confirm').disabled=true;$('part-thumbnail').hidden=true;$('part-no-thumbnail').hidden=false;$('part-no-thumbnail').textContent='Select a part to view its thumbnail';$('part-details').replaceChildren();try{const rows=await api('searchPlmParts?q='+encodeURIComponent(query));if(serial!==partSearchSerial)return;partSearchResults=rows;$('part-empty').hidden=rows.length>0;$('part-empty').textContent='No matching parts found';$('part-count').textContent=rows.length+(rows.length===100?' (first 100 results)':' results');for(const part of rows){const tr=document.createElement('tr');tr.dataset.id=part.id;tr.tabIndex=0;tr.setAttribute('aria-selected','false');for(const value of [part.id,part.filename||part.name,part.cadVersion?'v'+part.cadVersion:'—',part.lifecycleState||'—']){const td=document.createElement('td');td.textContent=value;tr.append(td)}tr.onclick=()=>choosePlmPart(part);tr.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choosePlmPart(part)}};$('part-results').append(tr)}}catch(e){if(serial!==partSearchSerial)return;$('part-empty').hidden=false;$('part-empty').textContent=e.message}}
$('add').onclick=()=>{$('part-dialog').showModal();$('part-query').focus();searchPlmParts()};
$('part-search-form').onsubmit=e=>{e.preventDefault();searchPlmParts()};
for(const id of ['part-cancel','part-close'])$(id).onclick=()=>$('part-dialog').close();
$('part-confirm').onclick=async()=>{const part=chosenPart;if(!part)return;$('part-confirm').disabled=true;try{await addPart({id:part.id,source:'plm',name:part.filename||part.name});renderObjects();fit();$('part-dialog').close();status('Added '+(part.filename||part.name))}catch(e){status(e.message)}finally{$('part-confirm').disabled=false}};
$('upload').onchange=async()=>{const file=$('upload').files[0];if(!file)return;try{
 const ext=file.name.toLowerCase();
 if(ext.endsWith('.asmj')){
  const doc=JSON.parse(await file.text());if(doc.format!=='PartsManagerAssembly'||!Array.isArray(doc.nodes))throw Error('Invalid ASMJ file');
  const saved=await api('importScene',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:filenameLabel(file.name),scene:doc})});
  await addAssemblyReference({assemblyId:saved.id,name:filenameLabel(file.name)});fit();status('Imported ASMJ '+file.name);
 }else if(ext.endsWith('.glb')){
  const units=await requestModelUnits();if(!units){status('Import cancelled');return}
  const form=new FormData();form.append('file',file);const m=await api('upload',{method:'POST',body:form});await refresh();await addPart({id:m.id,source:'uploaded',name:filenameLabel(file.name),geometryUnits:units});renderObjects();fit();status('Imported GLB '+file.name);
 }else throw Error('Select a .glb or .asmj file');
 }catch(e){status(e.message)}finally{$('upload').value=''}};
$('restore-locations').onclick=restoreLocations;
$('save-menu').onclick=()=>{const menu=$('save-options');menu.hidden=!menu.hidden;$('save-menu').setAttribute('aria-expanded',String(!menu.hidden))};
function closeSaveMenu(){$('save-options').hidden=true;$('save-menu').setAttribute('aria-expanded','false')}
document.addEventListener('click',e=>{if(!e.target.closest('.gv-save-menu'))closeSaveMenu()});
$('refresh-links').onclick=async()=>{try{for(const e of entries.filter(x=>x.kind==='assembly')){for(const child of e.children||[])e.object.remove(child.object);e.children=[];e.error=null;const doc=await api('loadScene/'+e.assemblyId);await buildNodes(doc.scene,e,[e.assemblyId])}renderObjects();updateMeasures();status('Linked assemblies refreshed')}catch(e){status(e.message)}};
$('update').onclick=async()=>{try{const parts=allEntries().filter(e=>e.kind==='part'&&e.source==='plm');if(!parts.length){status('No PLM parts to check');return}const versions=await api('partVersions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids:[...new Set(parts.map(e=>e.id))]})});const changes=parts.filter(e=>{const latest=versions[String(e.id)];e.updateAvailable=!!(latest&&latest.id!==e.id&&latest.previewAvailable);e.latest=latest;return e.updateAvailable});renderObjects();if(!changes.length){status('All PLM parts are current or no newer GLB preview is available');return}const message=changes.map(e=>e.name+': '+(e.cadVersion||'unknown')+' → '+e.latest.version).join('\n');if(!confirm('Update '+changes.length+' part instance(s) to the latest available PLM preview?\n'+message))return;for(const e of changes){const m=await findModel(e.latest.id,'plm');const gltf=await loadModelWithProgress(m.url,e.name);const old=e.object.children[0];const oldScale=old.scale.clone();e.object.remove(old);const object=gltf.scene;object.scale.copy(oldScale);e.object.add(object);e.id=m.id;e.cadVersion=e.latest.version;e.updateAvailable=false}select(null);updateMeasures();renderObjects();status('Updated '+changes.length+' part instances; save the scene to retain the updates')}catch(e){status(e.message)}};
let deletedEntry=null;
function updateDeleteButtons(){$('delete').disabled=!selected;$('undo-delete').disabled=!deletedEntry}
function deleteSelected(){
 if(!selected)return;
 const entry=selected,parent=allEntries().find(e=>e.children?.includes(entry));
 const siblings=parent?parent.children:entries,index=siblings.indexOf(entry);
 if(index<0)return;
 deletedEntry={entry,parent,index};siblings.splice(index,1);entry.object.parent?.remove(entry.object);
 select(null);renderObjects();updateMeasures();updateSection();updateDeleteButtons();
 status('Removed '+entry.name+' from this scene. Save to keep the change. Ctrl+Z to undo.');
}
function undoDelete(){
 if(!deletedEntry)return;const {entry,parent,index}=deletedEntry;deletedEntry=null;
 const siblings=parent?parent.children:entries;
 siblings.splice(Math.min(index,siblings.length),0,entry);
 (parent?parent.object:scene).add(entry.object);
 select(entry);renderObjects();updateMeasures();updateSection();updateDeleteButtons();status('Restored '+entry.name);
}
document.getElementById('gv-tree').addEventListener('click',()=>setTimeout(updateDeleteButtons,0));renderer.domElement.addEventListener('pointerdown',()=>setTimeout(updateDeleteButtons,0));
$('delete').onclick=deleteSelected;$('undo-delete').onclick=undoDelete;
$('remove').onclick=deleteSelected;
window.addEventListener('keydown',event=>{
 const tag=event.target?.tagName?.toLowerCase();if(['input','textarea','select'].includes(tag)||event.target?.isContentEditable)return;
 if(event.key==='Delete'&&!event.ctrlKey&&!event.metaKey){event.preventDefault();deleteSelected()}
 if(event.key.toLowerCase()==='z'&&(event.ctrlKey||event.metaKey)&&!event.shiftKey&&deletedEntry){event.preventDefault();undoDelete()}
});
$('reset').onclick=()=>{if(!selected)return;selected.object.position.set(0,0,0);selected.object.quaternion.identity();selected.object.scale.set(1,1,1);updateFields();updateMeasures()};$('fit').onclick=fit;
$('units').onchange=()=>{unit=validUnit($('units').value);updateMeasures()};
function nodeSnapshot(e){const common={instanceId:e.instanceId,name:e.name,defaultLocation:e.defaultLocation,color:e.partColor||null,...transformOf(e)};return e.kind==='assembly'?{type:'assemblyReference',assemblyId:e.assemblyId,versionPolicy:'latest',...common}:{type:'partInstance',id:e.id,source:e.source,geometryUnits:e.geometryUnits,cadVersion:e.cadVersion,defaultLocation:e.defaultLocation,...common}}
function snapshot(){return {id:activeSceneId,name:$('scene-name').value||'Untitled Scene',shared:$('shared').checked,format:'PartsManagerAssembly',schemaVersion:2,units:'mm',nodes:entries.map(nodeSnapshot),measurements,notes:sceneNotes.map(n=>({id:n.id,name:n.name,instanceId:n.instanceId})),sections:[sectionConfig()],camera:{projection:perspectiveEnabled?'perspective':'orthographic',spinCenter,position:camera.position.toArray(),target:orbit.target.toArray(),up:camera.up.toArray()},displayUnits:unit,tree:{left:$('tree-overlay').style.left,top:$('tree-overlay').style.top}}}
const saveDialog=$('save-dialog');let saveDialogBusy=false;let saveAsNewPending=false;
function showSaveDialog(asNew=false){saveAsNewPending=asNew;const name=$('scene-name').value.trim();$('save-name').value=name==='Untitled Scene'?'':name;$('save-share').checked=$('shared').checked;$('save-error').hidden=true;saveDialog.showModal();$('save-name').focus();$('save-name').select()}
function closeSaveDialog(){if(!saveDialogBusy)saveDialog.close()}
$('save-close').onclick=closeSaveDialog;$('save-cancel').onclick=closeSaveDialog;
$('save-form').addEventListener('submit',async event=>{event.preventDefault();if(saveDialogBusy)return;const name=$('save-name').value.trim();if(!name||name.length>160){$('save-error').textContent='Enter a scene name (maximum 160 characters).';$('save-error').hidden=false;$('save-name').focus();return}saveDialogBusy=true;$('save-confirm').disabled=true;$('save-error').hidden=true;try{await saveSceneRecord(saveAsNewPending,name,$('save-share').checked);saveDialog.close()}catch(e){$('save-error').textContent=e.message;$('save-error').hidden=false}finally{saveDialogBusy=false;$('save-confirm').disabled=false}});
async function saveSceneRecord(asNew,name,shared){const body=snapshot();if(asNew)body.id=null;if(name!==undefined)body.name=name;if(shared!==undefined)body.shared=shared;const saved=await api('saveScene',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});activeSceneId=saved.id;sceneCreator=viewerUsername;$('scene-name').value=saved.name;$('shared').checked=saved.shared===true;await refresh();$('scenes').value=String(saved.id);status('Scene saved');return saved}
async function save(asNew){if(asNew||!activeSceneId){showSaveDialog(asNew);return}try{await saveSceneRecord(false)}catch(e){status(e.message)}}
$('save').onclick=()=>{closeSaveMenu();save(false)};$('save-new').onclick=()=>{closeSaveMenu();save(true)};$('export').onclick=()=>{closeSaveMenu();const blob=new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=($('scene-name').value||'assembly').replace(/[^a-z0-9_-]/gi,'_')+'.asmj';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
async function loadScene(id){deletedEntry=null;updateDeleteButtons();const data=await api('loadScene/'+id);clearScene();await buildNodes(data.scene,null,[Number(id)]);restoreNotes(data.scene.notes);sceneCreator=data.owner||data.createdBy||sceneRows.find(s=>String(s.id)===String(id))?.owner||null;activeSceneId=data.id;$('scene-name').value=data.name;$('shared').checked=data.shared;measurements=Array.isArray(data.scene.measurements)?data.scene.measurements:[];unit=validUnit(data.scene.displayUnits||'mm');$('units').value=unit;const sec=data.scene.sections?.[0];if(sec){$('section-enabled').checked=sec.enabled===true;$('section-axis').value=sec.axis||'z';$('section-position').value=number(sec.position);$('section-rotation').value=number(sec.rotation);$('section-rotation-label').textContent=$('section-rotation').value+'°';$('section-reverse').checked=sec.reversed===true;$('section-scope').value=sec.scope||'scene';$('section-show-plane').checked=sec.showPlane!==false;$('section-cap').checked=sec.cap!==false;$('section-cap-color').value=/^#[0-9a-f]{6}$/i.test(sec.capColor||'')?sec.capColor:'#d94a40'}updateSection();const c=data.scene.camera;if(c){switchProjection(c.projection==='perspective');setSpinCenter(c.spinCenter||'model');if(Array.isArray(c.position))camera.position.fromArray(c.position);if(Array.isArray(c.target))orbit.target.fromArray(c.target);if(Array.isArray(c.up))camera.up.fromArray(c.up);orbit.update()}else fit();const tree=data.scene.tree||{};if(tree.left)$('tree-overlay').style.left=tree.left;if(tree.top)$('tree-overlay').style.top=tree.top;updateMeasures();renderObjects();const missing=allEntries().filter(e=>e.missingGeometry);status('Loaded '+data.name+(missing.length?' ('+missing.length+' missing GLB'+(missing.length===1?'':'s')+')':''))}
$('load').onclick=()=>loadScene($('scenes').value).catch(e=>status(e.message));$('refresh').onclick=()=>refresh().catch(e=>status(e.message));
// Saved scene manager: selection is independent of the currently loaded scene.
const viewerUsername=document.getElementById('gv-root').dataset.viewerUser||'';const sceneDialog=$('scenes-dialog');let sceneRows=[],sceneChoice=null;
function sceneButtons(){const row=sceneRows.find(s=>String(s.id)===String(sceneChoice));const mine=row&&row.owner===viewerUsername;$('scenes-load').disabled=!row;$('scenes-share').disabled=!mine;$('scenes-delete').disabled=!mine;$('scenes-share').textContent=row?.shared?'Unshare':'Share'}
function sceneSelection(id){sceneChoice=id;for(const tr of $('scenes-results').rows)tr.setAttribute('aria-selected',String(tr.dataset.sceneId===String(id)));sceneButtons()}
function renderSceneRows(){const tbody=$('scenes-results');tbody.replaceChildren();for(const s of sceneRows){const tr=document.createElement('tr');tr.dataset.sceneId=String(s.id);tr.tabIndex=0;for(const v of [s.name,s.owner,s.shared?'Yes':'No',s.updated?new Date(s.updated).toLocaleString():'—']){const td=document.createElement('td');td.textContent=v;tr.append(td)}tr.onclick=()=>sceneSelection(s.id);tr.ondblclick=()=>openSelectedScene();tr.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();sceneSelection(s.id)}};tbody.append(tr)}$('scenes-empty').hidden=sceneRows.length!==0;sceneSelection(sceneRows.some(s=>String(s.id)===String(sceneChoice))?sceneChoice:null);$('scenes-status').textContent=sceneRows.length+' scene(s)'}
async function refreshSceneRows(){sceneRows=await api('scenes');renderSceneRows()}
async function openSelectedScene(){if(!sceneChoice)return;try{await loadScene(sceneChoice);sceneDialog.close()}catch(e){$('scenes-status').textContent=e.message}}
$('scene-open').onclick=async()=>{sceneDialog.showModal();$('scenes-status').textContent='Loading scenes…';try{await refreshSceneRows()}catch(e){$('scenes-status').textContent=e.message}};
$('scenes-close').onclick=$('scenes-cancel').onclick=()=>sceneDialog.close();
$('scenes-load').onclick=openSelectedScene;
$('scenes-share').onclick=async()=>{const row=sceneRows.find(s=>String(s.id)===String(sceneChoice));if(!row)return;try{await api('shareScene/'+row.id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({shared:!row.shared})});if(String(activeSceneId)===String(row.id))$('shared').checked=!row.shared;await refreshSceneRows();status('Scene sharing updated')}catch(e){$('scenes-status').textContent=e.message}};
$('scenes-delete').onclick=async()=>{const row=sceneRows.find(s=>String(s.id)===String(sceneChoice));if(!row||!confirm('Delete saved scene "'+row.name+'"? This cannot be undone.'))return;try{await api('deleteScene/'+row.id,{method:'POST'});if(String(activeSceneId)===String(row.id)){activeSceneId=null;$('shared').checked=false}sceneChoice=null;await refreshSceneRows();status('Scene deleted')}catch(e){$('scenes-status').textContent=e.message}};


// Scene annotations and per-occurrence color overrides. Stored with the scene.
let sceneNotes=[],sceneCreator=null;
function applyPartColor(entry,hex){
 if(!entry||!/^#[0-9a-f]{6}$/i.test(hex))return;
 const wasSelected=selected===entry;if(wasSelected)clearHighlight();
 entry.partColor=hex;
 entry.object.traverse(node=>{if(!node.isMesh||node.userData.gvNote)return;
  const paint=material=>{const copy=material.clone();if(copy.color)copy.color.set(hex);return copy};
  node.material=Array.isArray(node.material)?node.material.map(paint):paint(node.material);
 });
 if(wasSelected)highlight(entry);
}
function noteSprite(label){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(20,31,45,.88)';ctx.fillRect(0,0,512,128);
 ctx.strokeStyle='#f5c04e';ctx.lineWidth=6;ctx.strokeRect(3,3,506,122);
 ctx.font='bold 33px sans-serif';ctx.textBaseline='middle';ctx.fillStyle='#fff';
 let display=label;if(ctx.measureText(display).width>475){while(display.length>1&&ctx.measureText(display+'…').width>475)display=display.slice(0,-1);display+='…'}
 ctx.fillText(display,18,64);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));sprite.userData.gvNote=true;
 return sprite;
}
function attachNote(note){
 const entry=allEntries().find(e=>e.instanceId===note.instanceId);if(!entry)return false;
 const sprite=noteSprite(note.name);entry.object.updateWorldMatrix(true,true);
 const box=new THREE.Box3();entry.object.traverse(o=>{if(o.isMesh&&o.geometry){const b=new THREE.Box3().setFromObject(o);box.union(b)}});
 let local=new THREE.Vector3(0,0,0);let size=100;
 if(!box.isEmpty()){const center=box.getCenter(new THREE.Vector3());center.z=box.max.z;local=entry.object.worldToLocal(center);size=Math.max(20,box.getSize(new THREE.Vector3()).length()*.15)}
 sprite.position.copy(local);sprite.position.z+=size*.4;sprite.scale.set(size*3.2,size*.8,1);
 entry.object.add(sprite);note.sprite=sprite;return true;
}
function clearNotes(){for(const note of sceneNotes){if(note.sprite){note.sprite.parent?.remove(note.sprite);note.sprite.material.map?.dispose();note.sprite.material.dispose()}}sceneNotes=[]}
function restoreNotes(saved){clearNotes();for(const data of Array.isArray(saved)?saved:[]){if(typeof data.name!=='string'||!data.instanceId)continue;const note={id:data.id||uuid(),name:data.name.slice(0,200),instanceId:data.instanceId};if(attachNote(note))sceneNotes.push(note)}}
function showNotesList(){const list=$('notes-list');list.replaceChildren();for(const note of sceneNotes){const p=document.createElement('p');p.textContent=note.name+' — '+(allEntries().find(e=>e.instanceId===note.instanceId)?.name||'Unknown');list.append(p)}if(!sceneNotes.length){const p=document.createElement('p');p.textContent='No notes in this scene.';list.append(p)}}
$('color-open').onclick=()=>{if(!selected){status('Select a part before changing its color');return}const input=document.createElement('input');input.type='color';input.value=selected.partColor||'#b8c8dc';input.style.cssText='position:fixed;left:-100px;top:0';document.body.append(input);input.addEventListener('input',()=>applyPartColor(selected,input.value));input.addEventListener('change',()=>{applyPartColor(selected,input.value);input.remove();status('Part color changed')});input.addEventListener('blur',()=>setTimeout(()=>input.remove(),250));input.click()};
$('info-open').onclick=()=>{
 const models=allEntries();const geometries=new Set(),textures=new Set();let bytes=0;
 for(const e of models)e.object.traverse(o=>{if(!o.isMesh||o.userData.gvNote)return;if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m)for(const value of Object.values(m))if(value?.isTexture)textures.add(value)});
 for(const geometry of geometries){for(const attr of Object.values(geometry.attributes||{}))if(attr?.array)bytes+=attr.array.byteLength;if(geometry.index?.array)bytes+=geometry.index.array.byteLength}
 for(const texture of textures){const im=texture.image;if(im?.width&&im?.height)bytes+=im.width*im.height*4}
 $('info-name').textContent=$('scene-name').value||'Unsaved scene';$('info-creator').textContent=sceneCreator||($('scene-name').value?'Unknown':viewerUsername||'Current user');
 $('info-count').textContent=String(models.length);$('info-memory').textContent=(bytes/1048576).toFixed(1)+' MB (estimated geometry + textures)';$('info-dialog').showModal();
};
$('info-close').onclick=$('info-done').onclick=()=>$('info-dialog').close();
$('notes-open').onclick=()=>{$('notes-target').textContent=selected?'Attach note to: '+selected.name:'Select a model before adding a note.';$('notes-add').disabled=!selected;$('notes-name').value='';$('notes-error').hidden=true;showNotesList();$('notes-dialog').showModal()};
$('notes-close').onclick=$('notes-cancel').onclick=()=>$('notes-dialog').close();
$('notes-form').addEventListener('submit',e=>{e.preventDefault();const name=$('notes-name').value.trim();if(!selected||!name){$('notes-error').textContent='Select a model and enter a note.';$('notes-error').hidden=false;return}const note={id:uuid(),instanceId:selected.instanceId,name};if(attachNote(note)){sceneNotes.push(note);$('notes-name').value='';showNotesList();status('Note added to '+selected.name)}});
$('notes-clear').onclick=()=>{if(!sceneNotes.length)return;if(!confirm('Clear all notes in this scene?'))return;clearNotes();showNotesList();status('All notes cleared')};

const treeOverlay=$('tree-overlay'),treeHandle=$('tree-handle');let treeDrag=null;treeHandle.addEventListener('pointerdown',e=>{if(e.button!==0)return;treeDrag={x:e.clientX,y:e.clientY,left:treeOverlay.offsetLeft,top:treeOverlay.offsetTop};treeHandle.setPointerCapture(e.pointerId);e.preventDefault()});treeHandle.addEventListener('pointermove',e=>{if(!treeDrag)return;const parent=treeOverlay.parentElement;treeOverlay.style.left=Math.max(0,Math.min(parent.clientWidth-60,treeDrag.left+e.clientX-treeDrag.x))+'px';treeOverlay.style.top=Math.max(0,Math.min(parent.clientHeight-35,treeDrag.top+e.clientY-treeDrag.y))+'px'});treeHandle.addEventListener('pointerup',()=>treeDrag=null);treeHandle.addEventListener('pointercancel',()=>treeDrag=null);
// Other Parts Manager modules enqueue requests through the authenticated viewer endpoint.
const viewerSession=uuid();async function pollRequests(){try{const requests=await api('pendingRequests?sessionId='+encodeURIComponent(viewerSession));for(const req of requests){if(req.type==='assembly')await addAssemblyReference({assemblyId:req.assemblyId,name:req.name});else await addPart({id:req.partId,source:req.source||'plm',name:req.name});renderObjects();fit();status('Added request from '+(req.origin||'Parts Manager'))}}catch(e){console.warn('Viewer request polling:',e.message)}}
setInterval(pollRequests,4000);refresh().then(pollRequests).catch(e=>status('Unable to load viewer catalog: '+e.message));
