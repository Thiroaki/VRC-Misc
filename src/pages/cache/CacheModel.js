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
        this.ClearJobLocked = false;

        setTimeout(()=>{
            this.loadCacheStatus();
        }, 0);        
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
        if(!this.ClearJobLocked){
            this.ClearJobLocked = true;
            this.View.setClearButtonDisable();
            setTimeout(()=>{
                this.clearCache(limit);
                this.loadCacheStatus();
                this.updateCacheInfo();
                this.View.setClearButtonEnable();
                this.ClearJobLocked = false;
            }, 200);
        }
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
        console.log(limit);
        console.log(cnt);
        console.log("Clear!");
        
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
        console.log("Update!");
        
    }

    loadCacheStatus(){
        // ファイル配列とトータルサイズ取得
        const userName = process.env['USERPROFILE'].split(path.sep)[2];
        const cachepath = ["C:/Users/"+userName+"/AppData/LocalLow/VRChat/VRChat/VRCHTTPCache",
                    "C:/Users/"+userName+"/AppData/LocalLow/VRChat/VRChat/HTTPCache-WindowsPlayer"];

        this.CacheFiles.length = 0;
        let totalSize=0;
        let totalCount=0;

        for(let i=0; i<cachepath.length; i++){
            if(path.isAbsolute(cachepath[i])){
                try{
                    let files = fs.readdirSync(cachepath[i]);
                    for (let j=0; j < files.length; j++) {
                        let file = files[j];
                        let fp = path.join(cachepath[i], file);
                        let stat = fs.statSync(fp);
                        if (!stat.isDirectory()) {
                            // キャッシュファイル1個に対しての処理
                            totalCount++;
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
        console.log("Load Finish");
        
    }
}