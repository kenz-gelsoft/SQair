window.addEventListener('load', function (e) {
    var chooser = document.getElementById('chooser');
    chooser.addEventListener('change', function (e) {
        var preview = document.getElementById('preview');
        var dataUrl = URL.createObjectURL(chooser.files[0]);
        preview.style.backgroundImage = 'url(' + dataUrl + ')';
    }, false);
}, false);
