var fs = require('fs');
var path = require('path');
var userName = process.env['USERPROFILE'].split(path.sep)[2];
var cachepath = ["C:/Users/"+userName+"/AppData/LocalLow/VRChat/VRChat/VRCHTTPCache",
                  "C:/Users/"+userName+"/AppData/LocalLow/VRChat/VRChat/HTTPCache-WindowsPlayer"];
var cacheFileStats = [];


$(function(){
    // ドロップダウンリスト設定
    for(let i=0; i<24; i++){
        $("#hour").append("<option value="+i+">"+i+"時</option>");
    }
    for(let i=0; i<60; i+=10){
        $("#minute").append("<option value="+i+">"+i+"分</option>");
    }

    // キャッシュ情報セット    
    setCacheInfo("#total-count", "#total-size");

});

$("#clear-now").on("click", function(){
    let limitDay = $("#limit-day").val();
    l(limitDay);
});

$("#cache-schedule-info").on("click", function(){
    
});


function setCacheInfo(countSel, sizeSel){
    let totalSize=0;
    let totalCount=0;

    // フォルダ内のファイル名を取得
    for(let i=0; i<cachepath.length; i++){
        if(path.isAbsolute(cachepath[i])){
            fs.readdir(cachepath[i], (err, files) => {
                if (err) setErr;

                totalCount += files.length;
                // ファイルだけでループしてトータルサイズ取得
                for (let file of files) {
                    let fp = path.join(cachepath[i], file);
                    fs.stat(fp, (err, stats) => {
                        if (err) setErr;

                        if (!stats.isDirectory()) {
                            totalSize += stats.size;
                            stats.name = fp;
                            cacheFileStats.push(stats);
                        }

                        if(String(totalSize).length > 9){
                            // GB表示
                            dispSize = (totalSize/1024**3).toFixed(2);
                            $(sizeSel).text(dispSize+"GB");
                        }else{
                            // MB表示
                            dispSize = (totalSize/1024**2).toFixed(2);
                            $(sizeSel).text(dispSize+"MB");
                        }
                        //l(typeof(stats.atime));
                    });                    
                }
                $(countSel).text(totalCount);
            });
        }else{
            error = "args["+i+"] is not absolute path.";
        }
    }

    function setErr(){
        $(countSel).text("read error");
        $(sizeSel).text("read error");
        return;
    }

}

function l(arg) {console.log(arg)}