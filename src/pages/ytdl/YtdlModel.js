module.exports = class YtdlModel{
    constructor(){
        this.exec = require('child_process').exec;
        this.YtdlView = require("./YtdlView");
        this.View = new this.YtdlView(this);

        this.remoteVersion = "";
        this.localVersion = "";

        // 起動時処理
        //this.checkYtdlVersion();
    }


    onSelect(){
        setTimeout(()=>{
            this.View.setView();
            this.View.setVersion(this.remoteVersion, this.localVersion);
        }, 0);
    }

    checkYtdlVersion(){
        //バージョン確認
        const ytdlUrl = "https://api.github.com/repos/ytdl-org/youtube-dl/releases/latest";
        $.getJSON(ytdlUrl, (json)=>{
            this.remoteVersion = json.tag_name;
        });

        //TODO configに置き換える
        let ytdl_path = "D:/Steam/steamapps/common/VRChat/VRChat_Data/StreamingAssets/youtube-dl.exe";
        this.exec(ytdl_path+" --version", (err, out, stderr) => {
            this.localVersion = out;
        });
    }
}