package glbviewer

class ViewerScene {
    String name
    String ownerUsername
    boolean shared = false
    String sceneJson
    Date dateCreated
    Date lastUpdated
    static mapping = { sceneJson type: 'text' }
    static constraints = {
        name blank: false, maxSize: 160
        ownerUsername blank: false
        sceneJson blank: false, maxSize: 200000
    }
}
