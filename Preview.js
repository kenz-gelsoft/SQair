function Preview(aId) {
    this._elt = document.getElementById(aId);
}
Preview.prototype = {
    set: function (aFile) {
        this._objUrl = URL.createObjectURL(aFile);
        this._elt.style.backgroundImage = 'url(' + this._objUrl + ')';

        this.rotateByExif(aFile);
    },
    reset: function () {
        if (!this._objUrl) {
            return;
        }
        this._elt.style.backgroundImage = null;
        this._elt.style.transform = null;
        URL.revokeObjectURL(this._objUrl);
    },
    rotateByExif: function (aFile) {
        var that = this;
        EXIF.getData(aFile, function () {
            that.orientation = EXIF.getTag(this, 'Orientation');
            that._elt.style.transform = that.rotation();
            that._elt.style.color = 'transparent';
        });
    },
    rotation: function () {
        switch (this.orientation) {
        case 3:     return 'rotate(180deg)';
        case 6:     return 'rotate(90deg)';
        case 8:     return 'rotate(270deg)';
        case 1:
        default:    return null;
        }
    },
};
