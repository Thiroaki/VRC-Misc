var fs = require('fs');
var path = require('path');


$(function(){
    let userName = process.env['USERPROFILE'].split(path.sep)[2];
    let cachepath = "C:/Users/"+userName+"/AppData/LocalLow/VRChat/VRChat/VRCHTTPCache"
    let totalSize = 0;
    
    for(let i=0; i<24; i++){
        $("#hour").append("<option value="+i+">"+i+"時</option>");
    }
    for(let i=0; i<60; i+=10){
        $("#minute").append("<option value="+i+">"+i+"分</option>");
    }

    // フォルダ内のファイル名を取得
    fs.readdir(cachepath, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        
        // ファイルだけでループしてトータルサイズ取得
        for (const file of files) {
            const fp = path.join(cachepath, file);
            fs.stat(fp, (err, stats) => {
                if (err) {
                    console.error(err);
                    return;   
                }
                if (!stats.isDirectory()) {
                    totalSize += stats.size;
                    if(String(totalSize).length > 9){
                        // GB表示
                        let dispSize = totalSize/1024**3;
                        dispSize = String(dispSize.toFixed(2));
                        $("#total-size").text(dispSize);
                    }else{
                        // GB表示
                        let dispSize = totalSize/1024**2;
                        dispSize = String(dispSize.toFixed(2));
                        $("#total-size").text(dispSize);
                    }
                    
                }
            });
        }
        $("#total-count").text(files.length);
    });
    
    
});

$("#cache-schedule-info").on("click", function(){
    
});