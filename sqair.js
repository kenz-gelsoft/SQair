window.addEventListener('load', function (e) {
    // var animate = document.getElementById('animate');
    // animate.addEventListener('click', function () {
    //     animateUploading();
    //     setTimeout(function () {
    //         animateUploaded(true);
    //     }, 1000);
    // }, false);

    var chooser = document.getElementById('chooser');
    var preview = new Preview('preview');
    chooser.addEventListener('change', function (e) {
        preview.set(chooser.files[0]);
    }, false);

    var app = document.getElementById('app');
    app.addEventListener('submit', function (e) {
        animateUploading(function () {
            var file = chooser.files[0];
            resizeIfTooLarge(file, function (aResized) {
                upload(aResized, function (aError) {
                    if (aError) {
                        alert(aError);
                    }
                    preview.reset();
                    animateUploaded(!aError);
                });
            });
        });
        e.preventDefault();
    }, false);
}, false);

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

function upload(aBlob, aCallback) {
    writeProtect(function (xhr) {
        xhr.onload = function () {
            var date = new Date();
            setFileTime(date, function (xhr) {
                xhr.onload = function () {
                    uploadBlob(aBlob, date, function (xhr) {
                        xhr.onload = function () {
                            aCallback();
                        };
                        xhr.onerror = function () {
                            aCallback('アップロードに失敗しました。');
                        };
                    });
                };
                xhr.onerror = function () {
                    aCallback('システム時刻の設定に失敗しました。');
                };
            });
        };
        xhr.onerror = function () {
            aCallback('ライトプロテクトの設定に失敗しました。');
        };
    });
}

function animateUploading(aCallback) {
    var film = document.getElementById('film');
    var r = film.getBoundingClientRect();
    var dy = getCenterY() + r.height / 2;
    film.style.top  = -dy + 'px';

    setTimeout(function () {
        aCallback();
    }, 1 * 1000);
}
var center = 0;
function getCenterY() {
    if (center == 0) {
        var film = document.getElementById('film');
        var r = film.getBoundingClientRect();
        center = r.top + r.height / 2;
    }
    return center;
}

function animateUploaded(aSucceeded) {
    var filmBack = document.getElementById('film-back');
    if (aSucceeded) {
        var r = filmBack.getBoundingClientRect();
        filmBack.style.top = (getCenterY() + r.height / 2) + 'px';
    }

    var film = document.getElementById('film');
    setTimeout(function () {
        [film, filmBack].forEach(resetState);
    }, transitionDuration(filmBack));
}

function resetState(aLayer) {
    aLayer.style.opacity = 0;
    var duration = transitionDuration(aLayer);
    setTimeout(function () {
        aLayer.style.display = 'none';
        aLayer.style.top = 0;
        aLayer.style.display = 'block';
        setTimeout(function () {
            aLayer.style.opacity = 1;
        }, duration);
    }, duration);
}

function transitionDuration(aElt) {
    var style = getComputedStyle(aElt);
    return 1000 * parseFloat(style.transitionDuration);
}

function uploadBlob(aBlob, aDate, aSetupListeners) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://flashair/upload.cgi', true);
    aSetupListeners(xhr);
    var formData = new FormData();
    formData.append('file', aBlob, fileNameAt(aDate));
    xhr.send(formData);
}
function writeProtect(aSetupListeners) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://flashair/upload.cgi?WRITEPROTECT=ON', true);
    aSetupListeners(xhr);
    xhr.send();
}
function setFileTime(aDate, aSetupListeners) {
    var xhr = new XMLHttpRequest();
    if (!aDate) {
        aDate = new Date();
    }
    // DATE
    // bit 15 ～ 9      年 (1980年をゼロ年とする)
    // bit  8 ～ 5      月 (1 ～ 12)
    // bit  4 ～ 0      日 (1 ～ 31)    
    var fatYear = aDate.getFullYear() - 1980;
    var fatMonth = aDate.getMonth() + 1;
    var fatDay = aDate.getDate();
    var hiWord = (fatYear << 9)
        | (fatMonth << 5)
        | fatDay;
    // TIME
    // bit 15 ～ 11       時
    // bit 10 ～  5       分
    // bit  4 ～  0       秒÷２
    var fatSeconds = Math.ceil(aDate.getSeconds() / 2);
    var loWord = (aDate.getHours() << 11)
        | (aDate.getMinutes() << 5)
        | fatSeconds;
    var ftime  = ((hiWord << 16) | loWord) & 0xFFFFFFFF;
    aSetupListeners(xhr);
    xhr.open('GET', 'http://flashair/upload.cgi?FTIME=0x' + ftime.toString(16).toUpperCase(), true);
    xhr.send();
}

function fileNameAt(aDate) {
    var sec = Math.floor(aDate.getTime() / 1000);
    var upper = Math.floor(sec / 10000);
    var lower = sec % 10000;

    var digits = 'ABCDEFGHIJKLMNOPQRSTUVWX';
    var radix = digits.length;
    var code = '';
    while (upper >= radix) {
        var c = upper % radix;
        code += digits[c];
        upper = Math.floor(upper / radix);
    }
    code += digits[c];

    code = ('AAAA' + code).slice(-4);
    lower = ('0000' + lower).slice(-4);
    return code + lower + '.JPG';
}

var IMAGE_SIZE = 1920;
function resizeIfTooLarge(aFile, aCallback) {
    loadImage(aFile, function (aImage) {
        var w = aImage.naturalWidth;
        var h = aImage.naturalHeight;
        // if (w <= IMAGE_SIZE ||
        //     h <= IMAGE_SIZE) {
        //     // 十分小さければ縮小しない
        //     aCallback(aFile);
        //     return;
        // }
        resizeImage(aImage, aCallback);
    });
}

function loadImage(aFile, aCallback) {
    var img = new Image();
    img.onload = function () {
        aCallback(img);
    };
    img.src = URL.createObjectURL(aFile);
}

function resizeImage(aImage, aCallback) {
    var x = 0;
    var y = 0;
    var w = aImage.naturalWidth;
    var h = aImage.naturalHeight;
    if (w > h) {
        // height を基準に計算する
        var ratio = IMAGE_SIZE / h;
        w *= ratio;
        h = IMAGE_SIZE;
        x = (IMAGE_SIZE - w) / 2;
    } else {
        // width を基準に計算する
        var ratio = IMAGE_SIZE / w;
        w = IMAGE_SIZE;
        h *= ratio;
        y = (IMAGE_SIZE - h) / 2;
    }
    var canvas = document.createElement('canvas');
    canvas.width  = IMAGE_SIZE;
    canvas.height = IMAGE_SIZE;
    var g = canvas.getContext('2d');
    g.drawImage(aImage, x, y, w, h);

    canvasToBlob(canvas, aCallback, 'image/jpeg');
}

function canvasToBlob(aCanvas, aCallback, aMimeType) {
    var dataUrl = aCanvas.toDataURL(aMimeType);
    var bin = atob(dataUrl.split(',')[1]);
    var array = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; ++i) {
        array[i] = bin.charCodeAt(i);
    }
    aCallback(new Blob([array], {type: aMimeType}));
}
