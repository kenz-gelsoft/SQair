window.addEventListener('load', function (e) {
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
