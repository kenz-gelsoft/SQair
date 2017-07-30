function Preview(aId) {
    this._elt = document.getElementById(aId);
}
Preview.prototype = {
    set: function (aFile) {
        this._objUrl = URL.createObjectURL(aFile);
        this._elt.style.backgroundImage = 'url(' + this._objUrl + ')';
    },
    reset: function () {
        if (!this._objUrl) {
            return;
        }
        this._elt.style.backgroundImage = null;
        URL.revokeObjectURL(this._objUrl);
    },
};
