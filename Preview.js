function Preview(aId) {
    this._elt = document.getElementById(aId);
}
Preview.prototype = {
    set: function (aFile) {
        this._objUrl = URL.createObjectURL(aFile);
        this._elt.style.backgroundImage = 'url(' + this._objUrl + ')';
        this._elt.style.color = 'transparent';

        this.rotateByExif(aFile);
    },
    reset: function () {
        if (!this._objUrl) {
            return;
        }
        this._elt.style.backgroundImage = null;
        this._elt.style.color = null;
        this._elt.style.transform = null;
        URL.revokeObjectURL(this._objUrl);
    },
    rotateByExif: function (aFile) {
        var that = this;
        EXIF.getData(aFile, function () {
            that.orientation = EXIF.getTag(this, 'Orientation');
            that._elt.style.transform = 'rotate(' + that.rotation() + 'deg)';
        });
    },
    rotation: function () {
        switch (this.orientation) {
        case 3:     return 180;
        case 6:     return 90;
        case 8:     return 270;
        case 1:
        default:    return 0;
        }
    },
};
