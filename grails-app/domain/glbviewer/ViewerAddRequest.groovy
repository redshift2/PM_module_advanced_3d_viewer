package glbviewer

/** Pending Add to Viewer operations for the authenticated owner. */
class ViewerAddRequest {
    String ownerUsername
    String itemType
    Long itemId
    String origin
    boolean delivered = false
    Date dateCreated
    static constraints = {
        ownerUsername blank:false
        itemType inList:['glb','assembly']
        itemId min:1L
        origin blank:false, maxSize:100
    }
}
