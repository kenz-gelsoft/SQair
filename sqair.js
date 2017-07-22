window.addEventListener('load', function (e) {
    var animate = document.getElementById('animate');
    animate.addEventListener('click', function () {
        animateUploading();
        setTimeout(function () {
            animateUploaded(true);
        }, 1000);
    }, false);

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
                // FIXME: too deep callstack
                upload(chooser.files[0], function (xhr) {
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
    formData.append('file', aFile);
    xhr.send(formData);
}
function writeProtect(aSetupListeners) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://flashair/upload.cgi?WRITEPROTECT=ON', true);
    aSetupListeners(xhr);
    xhr.send();
}
