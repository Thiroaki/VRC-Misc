// base.htmlと同じディレクトリで動作する
module.exports = class CacheModel{
    constructor(){
        this.CacheView = require("./CacheView");
        this.Store = require("electron-store");
        this.cron = require("node-cron");
        this.fs = require("fs");
        this.path = require("path");
        this._mlogger = require("../../module/mlogger/index");

        this.View = new this.CacheView(this);
        this.store = new this.Store();
        this.logger = new this._mlogger("cache");
        
        this.CacheFileStats = {count:0,size:0};
        this.CacheFiles = [];

        this.clearJob;

        this.loadCacheStatus();

        this.cacheJob = this.store.get("cacheJob");
        if(this.cacheJob != undefined && this.cacheJob.status){
            this.createJob(this.cacheJob.month, this.cacheJob.hour, this.cacheJob.limit);
        }else{
            this.cacheJob = {status:false, month:"1", hour:"0", limit:"30"}
            this.store.set("cacheJob", this.cacheJob);
        }
    }



    onSelect() {
        this.View.setView();
        this.View.setUiEvents();
        this.View.setLimitDay(this.store.get("cacheLimitDay"));
        this.updateCacheInfo();
        this.setJobInfo()
    }

    onLimitDayChanged(day){
        this.store.set("cacheLimitDay", day);
    }

    onClearButtonPress(limit) {
        this.View.setClearButtonDisable();
        setTimeout(()=>{
            this.clearCache(limit);
            this.loadCacheStatus();
            this.updateCacheInfo();
            this.View.setClearButtonEnable();
        }, 200);
    }

    onChangeClearJobParam(status, month, hour, limit){
        if(status){
            this.createJob(month, hour, limit);
        }else{
            this.destroyJob();
        }
    }



    createJob(month, hour, limit){
        this.cacheJob = {status:true, month:month, hour:hour, limit:limit};
        this.store.set("cacheJob", this.cacheJob);

        //月1:24日毎  月2:12日毎  週一:6日毎
        let cronText = `* ${hour} */${24/month} * *`;
        
        if(this.clearJob != undefined){
            this.clearJob.destroy();
        }
        this.clearJob = this.cron.schedule(cronText, ()=>{
            this.loadCacheStatus();
            this.clearCache(limit);
        });
        this.clearJob.start();
        this.logger.info("Job started", month, hour, limit);
    }
    destroyJob(){
        this.cacheJob.status = false
        this.store.set("cacheJob", this.cacheJob);
        if(this.clearJob != undefined){
            this.clearJob.destroy();
            this.logger.info("Job deleted");
        }
    }

    setJobInfo(){
        this.View.setJobInfo(this.cacheJob.status, this.cacheJob.month, this.cacheJob.hour, this.cacheJob.limit);
    }


    clearCache(limit){
        let nowDate = new Date(Date.now());
        let cnt = 0;

        for(let i=0; i < this.CacheFiles.length; i++){
            let file = this.CacheFiles[i];
            let distDays = (nowDate - file.atime) / 24 * 60*60*1000;
            if (distDays > limit) {
                this.fs.unlink(file.name, (err)=>{});
                cnt++;
            }
        }
        this.logger.info(cnt + " files cleared");
        
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
        const userFolder = process.env['USERPROFILE'];
        const cachepath = [`${userFolder}/AppData/LocalLow/VRChat/VRChat/VRCHTTPCache`,
                    `${userFolder}/AppData/LocalLow/VRChat/VRChat/HTTPCache-WindowsPlayer`];

        this.CacheFiles.length = 0;
        let totalSize=0;
        let totalCount=0;

        for(let i=0; i<cachepath.length; i++){
            if(this.path.isAbsolute(cachepath[i])){
                try{
                    let files = this.fs.readdirSync(cachepath[i]);
                    for (let j=0; j < files.length; j++) {
                        let file = files[j];
                        let fp = this.path.join(cachepath[i], file);
                        let stat = this.fs.statSync(fp);
                        if (!stat.isDirectory()) {
                            // キャッシュファイル1個に対しての処理
                            totalCount++;
                            totalSize += stat.size;
                            stat.name = fp;
                            this.CacheFiles.push(stat);
                        }
                    }
                }catch (e){
                    this.logger.warn("cache load stumbled\n" + e);
                }
            }
        }

        this.CacheFileStats.count = totalCount;
        this.CacheFileStats.size = totalSize;
        this.logger.info("cache load Finish");
        
    }
}