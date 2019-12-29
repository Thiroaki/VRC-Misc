var exec = require('child_process').exec;

$(function(){
    //バージョン確認
    $.getJSON("https://api.github.com/repos/ytdl-org/youtube-dl/releases",
    function(json){
        var version = json[0].tag_name;
        $("#remotever").text(version);
    });
    let ytdl_path = "D:/Steam/steamapps/common/VRChat/VRChat_Data/StreamingAssets/youtube-dl.exe";
    exec(ytdl_path+" --version", (err, out, stderr) => {
        $("#localver").text(out);
    });
});

$(function(){
    if($("#month").val() == "m"){
        $("#month").after('<select id="times"></select>');
        for(let i=1; i<31; i++){
            $("#times").append("<option value="+i+">"+i+"日</option>");
        }
    }
    

    for(let i=0; i<24; i++){
        $("#hour").append("<option value="+i+">"+i+"時</option>");
    }
    for(let i=0; i<60; i+=10){
        $("#minute").append("<option value="+i+">"+i+"分</option>");
    }
});