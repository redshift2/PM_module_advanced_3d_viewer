package glbviewer

class ViewerModel {
    String filename
    String storageKey
    String uploadedBy
    Long byteSize
    Date dateCreated
    static constraints = {
        filename blank: false, maxSize: 255
        storageKey blank: false, unique: true
        uploadedBy blank: false
        byteSize min: 1L
    }
}
