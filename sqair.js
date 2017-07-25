window.addEventListener('load', function (e) {
    // var animate = document.getElementById('animate');
    // animate.addEventListener('click', function () {
    //     animateUploading();
    //     setTimeout(function () {
    //         animateUploaded(true);
    //     }, 1000);
    // }, false);

    var chooser = document.getElementById('chooser');
    chooser.addEventListener('change', function (e) {
        var preview = document.getElementById('preview');
        var dataUrl = URL.createObjectURL(chooser.files[0]);
        preview.style.backgroundImage = 'url(' + dataUrl + ')';
    }, false);

    var app = document.getElementById('app');
    app.addEventListener('submit', function (e) {
        uploading = true;
        animateUploading();
        writeProtect(function (xhr) {
            xhr.onload = function () {
                var file = chooser.files[0];
                setFileTime(file.lastModifiedDate, function (xhr) {
                    xhr.onload = function () {
                        // FIXME: too deep callstack
                        upload(file, function (xhr) {
                            xhr.onload = function () {
                                uploading = false;
                                animateUploaded(true);
                            };
                            xhr.onerror = function () {
                                alert('アップロードに失敗しました。');
                                uploading = false;
                                animateUploaded(false);
                            };
                        });
                    };
                    xhr.onerror = function () {
                        alert('システム時刻の設定に失敗しました。');
                        uploading = false;
                        animateUploaded(false);
                    };
                });
            };
            xhr.onerror = function () {
                alert('ライトプロテクトの設定に失敗しました。');
                uploading = false;
                animateUploaded(false);
            };
        });
        e.preventDefault();
    }, false);
}, false);

var uploading = false;
var animating = false;
function animateUploading() {
    if (animating) {
        return;
    }
    animating = true;

    var film = document.getElementById('film');
    var r = film.getBoundingClientRect();
    var dy = getCenterY() + r.height / 2;
    film.style.top  = -dy + 'px';

    setTimeout(function () {
        animating = false;
        if (!uploading) {
            animateUploaded(true);
        }
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
    if (animating) {
        return;
    }

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

function upload(aFile, aSetupListeners) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://flashair/upload.cgi', true);
    aSetupListeners(xhr);
    var formData = new FormData();
    formData.append('file', aFile, fileNameAt(new Date()));
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
