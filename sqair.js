window.addEventListener('load', function (e) {
    var chooser = document.getElementById('chooser');
    chooser.addEventListener('change', function (e) {
        var preview = document.getElementById('preview');
        var dataUrl = URL.createObjectURL(chooser.files[0]);
        preview.style.backgroundImage = 'url(' + dataUrl + ')';
    }, false);

    var app = document.getElementById('app');
    app.addEventListener('submit', function (e) {
        writeProtect(function () {
            upload(chooser.files[0], function () {
                alert('送信成功！');
            }, function () {
                alert('アップロードに失敗しました。');
            });            
        }, function () {
            alert('ライトプロテクトの設定に失敗しました。');
        });
        e.preventDefault();
    }, false);
}, false);

function upload(aFile, aOnLoad, aOnError) {
    var xhr = new XMLHttpRequest();
    xhr.onload = aOnLoad;
    xhr.onerror = aOnError;
    xhr.open('POST', 'http://flashair/upload.cgi', true);
    var formData = new FormData();
    formData.append('file', aFile);
    xhr.send(formData);
}
function writeProtect(aOnLoad, aOnError) {
    var xhr = new XMLHttpRequest();
    xhr.onload = aOnLoad;
    xhr.onerror = aOnError;
    xhr.open('GET', 'http://flashair/upload.cgi?WRITEPROTECT=ON', true);
    xhr.send();
}
