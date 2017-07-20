window.addEventListener('load', function (e) {
    var chooser = document.getElementById('chooser');
    chooser.addEventListener('change', function (e) {
        var preview = document.getElementById('preview');
        var dataUrl = URL.createObjectURL(chooser.files[0]);
        preview.style.backgroundImage = 'url(' + dataUrl + ')';
    }, false);

    var app = document.getElementById('app');
    app.addEventListener('submit', function (e) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://flashair/upload.cgi', true);
        var formData = new FormData();
        formData.append('file', chooser.files[0]);
        xhr.send(formData);
        // writeProtect(function () {
        // });
        e.preventDefault();
    }, false);
}, false);

// function writeProtect(aCallback) {
//     var xhr = new XMLHttpRequest();
//     xhr.open('GET', 'http://flashair/upload.cgi?WRITEPROTECT=ON', true);
//     xhr.onload = aCallback;
//     xhr.send();
// }
