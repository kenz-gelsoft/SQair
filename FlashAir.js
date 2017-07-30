function FlashAir() {
}
FlashAir.prototype = {
    upload: function (aBlob, aFileName, aOnSuccess, aOnError) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://flashair/upload.cgi', true);
        xhr.onload  = aOnSuccess;
        xhr.onerror = aOnError;
        var formData = new FormData();
        formData.append('file', aBlob, aFileName);
        xhr.send(formData);
    },
    writeProtect: function (aOnSuccess, aOnError) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://flashair/upload.cgi?WRITEPROTECT=ON', true);
        xhr.onload  = aOnSuccess;
        xhr.onerror = aOnError;
        xhr.send();
    },
    fat32DateTime: function (aDate) {
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
        return '0x' + ftime.toString(16).toUpperCase();
    },
    setFileTime: function (aDate, aOnSuccess, aOnError) {
        var xhr = new XMLHttpRequest();
        if (!aDate) {
            aDate = new Date();
        }
        xhr.open('GET', 'http://flashair/upload.cgi?FTIME=' + this.fat32DateTime(aDate), true);
        xhr.onload  = aOnSuccess;
        xhr.onerror = aOnError;
        xhr.send();
    },
};
