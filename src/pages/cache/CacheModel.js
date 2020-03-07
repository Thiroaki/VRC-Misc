// base.htmlと同じディレクトリで動作する
module.exports = class CacheModel{
    constructor(){
        this.CacheView = require("./CacheView");
        this.Store = require("electron-store");
        this.cron = require("node-cron");
        this.View = new this.CacheView(this);
        this.store = new this.Store();
        
        this.CacheFileStats = {count:0,size:0};
        this.CacheFiles = [];

        this.View.setUiEvents();
        this.loadCacheStatus();
    }



    onSelect() {
        setTimeout(() => {
            this.View.setView();
            this.View.setUiEvents();
            this.View.setLimitDay(this.store.get("cacheLimitDay"));
            this.updateCacheInfo();
        }, 10);
        
    }

    onLimitDayChanged(day){
        this.store.set("cacheLimitDay", day);
    }

    onClearButtonPress(limit) {
        setTimeout(()=>{
            this.View.setClearButtonDisable();
            this.clearCache(limit);
            this.updateCacheInfo();
            this.View.setClearButtonEnable();
        }, 0);
        
    }

    onRegistButton(cronText, limit){
        
    }

    onUnRegistButton(){

    }



    clearCache(limit){
        let nowDate = new Date(Date.now());
        let cnt = 0;

        for(let i=0; i < this.CacheFiles.length; i++){
            let file = this.CacheFiles[i];
            let distDays = (nowDate - file.atime) / 86400000;
            if (distDays > limit) {
                fs.unlink(file.name, (err)=>{});
                cnt++;
            }
        }
        console.log(cnt);
    }

    updateCacheInfo(){
        let count = this.CacheFileStats.count;
        let totalSize = this.CacheFileStats.size;
        let dispSize;
        if(String(totalSize).length > 9){
            // GB表示
            dispSize = (totalSize/1024**3).toFixed(2) + "GB";
        }else{
            // MB表示
            dispSize = (totalSize/1024**2).toFixed(2) + "MB";
        }

        this.View.setCacheInfo(count, dispSize);
    }

    loadCacheStatus(){
        // ファイル配列とトータルサイズ取得
        setTimeout(() => {
            const userName = process.env['USERPROFILE'].split(path.sep)[2];
            const cachepath = ["C:/Users/"+userName+"/AppData/LocalLow/VRChat/VRChat/VRCHTTPCache",
                        "C:/Users/"+userName+"/AppData/LocalLow/VRChat/VRChat/HTTPCache-WindowsPlayer"];

            let totalSize=0;
            let totalCount=0;

            for(let i=0; i<cachepath.length; i++){
                if(path.isAbsolute(cachepath[i])){
                    try{
                        let files = fs.readdirSync(cachepath[i]);
                        totalCount += files.length;
                        
                        for (let file of files) {
                            let fp = path.join(cachepath[i], file);
                            let stat = fs.statSync(fp);
                            if (!stat.isDirectory()) {
                                // キャッシュファイル1個に対しての処理
                                totalSize += stat.size;
                                stat.name = fp;
                                this.CacheFiles.push(stat);
                            }
                        }
                    }catch (e){
                        console.log(e);
                    }
                }
            }

            this.CacheFileStats.count = totalCount;
            this.CacheFileStats.size = totalSize;
            this.updateCacheInfo();
        }, 0);
        
    }
}