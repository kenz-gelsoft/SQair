window.addEventListener('load', function (e) {
    var animate = document.getElementById('animate');
    animate.addEventListener('click', function () {
        animateUpload();
    }, false);

    var chooser = document.getElementById('chooser');
    chooser.addEventListener('change', function (e) {
        var preview = document.getElementById('preview');
        var dataUrl = URL.createObjectURL(chooser.files[0]);
        preview.style.backgroundImage = 'url(' + dataUrl + ')';
    }, false);

    var app = document.getElementById('app');
    app.addEventListener('submit', function (e) {
        writeProtect(function (xhr) {
            xhr.onload = function () {
                // FIXME: too deep callstack
                upload(chooser.files[0], function (xhr) {
                    xhr.onload = function () {
                        alert('送信成功！');
                    };
                    xhr.onerror = function () {
                        alert('アップロードに失敗しました。');
                    };
                });
            };
            xhr.onerror = function () {
                alert('ライトプロテクトの設定に失敗しました。');
            };
        });
        e.preventDefault();
    }, false);
}, false);

function animateUpload() {
    var film = document.getElementById('film');
    var r = film.getBoundingClientRect();
    var center = r.top + r.height / 2;
    var dy = center + r.height / 2;
    film.style.top  = -dy + 'px';

    setTimeout(function () {
        var filmBack = document.getElementById('film-back');
        var r2 = filmBack.getBoundingClientRect();
        filmBack.style.top = (center + r2.height / 2) + 'px';

        setTimeout(function () {
            resetState(film);
            resetState(filmBack);
        }, transitionDuration(filmBack));
    }, 1 * 1000);
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
