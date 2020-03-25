module.exports = class YtdlModel{
    constructor(){
        this.exec = require('child_process').exec;
        this.YtdlView = require("./YtdlView");
        this.Store = require("electron-store");
        this.cron = require("node-cron");
        this.request = require("request");
        this.crypto = require('crypto');
        this.fs = require("fs");
        //this.ipcRenderer = require("electron").ipcRenderer;

        this.View = new this.YtdlView(this);
        this.store = new this.Store();

        this.remoteVersion = "";
        this.localVersion = "";
        this.RemoteDownloadUrl = "";
        this.ChecksumDownloadUrl = "";
        this.UpdateLocked = false;

        this.updateJob;

        // 起動時処理
        this.checkYtdlVersion();

        this.ytdlJob = this.store.get("ytdlJob");
        if(this.ytdlJob != undefined && this.ytdlJob.status){
            this.createJob(this.ytdlJob.month, this.ytdlJob.hour);
        }else{
            this.ytdlJob = {status:false, month:"1", hour:"0"}
            this.store.set("ytdlJob", this.ytdlJob);
        }
    }


    onSelect(){
        this.remoteVersion = this.store.get("remoteVer");
        this.localVersion = this.store.get("localVer");
        this.RemoteDownloadUrl = this.store.get("remoteDlUrl");
        this.ChecksumDownloadUrl = this.store.get("chsumDlUrl");

        this.View.setView();
        this.View.setUiEvents();
        this.updateVersionInfo()
        this.setJobInfo();
    }


    async onClickUpdateButton(){
        if(!this.UpdateLocked){
            this.UpdateLocked = true;
            this.View.setUpdateButtonDisable();

            await this.checkYtdlVersion().catch((r)=>{console.log(r)});
            await this.updateYtdl().catch((r)=>{console.log(r)});

            setTimeout(() => {
                this.updateVersionInfo();
                this.View.setUpdateButtonEnable();
                this.UpdateLocked = false;
            }, 200);
        }
    }

    onRegist(status, month, hour){
        if(status){
            this.createJob(month, hour);
        }else{
            this.destroyJob();
        }
    }



    createJob(month, hour){
        this.ytdlJob = {status:true, month:month, hour:hour};
        this.store.set("ytdlJob", this.ytdlJob);

        //月1:24日毎  月2:12日毎  週一:6日毎
        let cronText = `* ${hour} */${24/month} * *`;

        if(this.updateJob != undefined){
            this.updateJob.destroy();
        }
        this.updateJob = this.cron.schedule(cronText, async ()=>{
            await this.checkYtdlVersion();
            await this.updateYtdl();
        });
        this.updateJob.start();
        console.log("Job started", month, hour);
    }
    destroyJob(){
        this.ytdlJob.status = false;
        this.store.set("ytdlJob", this.ytdlJob);
        if(this.updateJob != undefined){
            this.updateJob.destroy();
            console.log("Job deleted");
        }        
    }

    setJobInfo(){
        this.View.setJobInfo(this.ytdlJob.status, this.ytdlJob.month, this.ytdlJob.hour);
    }



    updateVersionInfo(){
        this.View.setVersion(this.remoteVersion, this.localVersion);
    }

    updateYtdl(){
        return new Promise((resolve, reject)=>{
            if (this.store.get("remoteVer") == this.store.get("localVer")){
                return resolve("ytdl is already latest");
            }
            
            let ytdl_path = this.store.get("vrcPath") + `\\VRChat_Data\\StreamingAssets\\youtube-dl.exe`;
            let bkup_path = this.store.get("vrcPath") + `\\VRChat_Data\\StreamingAssets\\youtube-dl_${this.localVersion}.exe`;
            let checksum;
            //チェックサム検証
            this.request({method:"get", url:this.ChecksumDownloadUrl}, (err,res,body)=>{
                if(err) {return reject("fail checksum download")};

                checksum = body.match(/(\w|\d){30,}/g)[1];
                this.request({method:"get", url:this.RemoteDownloadUrl, encoding:null}, (err, res, body)=>{
                    if (err) {return reject("fail exe download")};
                    
                    //リネームバックアップして保存
                    if(checksum == this.md5hex(body)){
                        this.fs.renameSync(ytdl_path, bkup_path);
                        this.fs.writeFileSync(ytdl_path, body, "binary");
                        this.localVersion = this.remoteVersion;
                        this.store.set("localVer", this.localVersion);
                    }
                    return resolve("update done");
                });
            });
        });
    }

    checkYtdlVersion(){
        return new Promise((resolve, reject)=>{
            //リモート
            const ytdlUrl = "https://api.github.com/repos/ytdl-org/youtube-dldhhsdf/releases/latest";
            this.request({method:"get", url:ytdlUrl, json:true, headers:{'User-Agent':'VRC-Misc'}}, (err, res, json)=>{
                if (err) { return reject("remote check error " + jqXHR.status)};
                
                this.remoteVersion = json.tag_name;
                this.RemoteDownloadUrl = `https://github.com/ytdl-org/youtube-dl/releases/download/${json.tag_name}/youtube-dl.exe`;
                this.ChecksumDownloadUrl = `https://github.com/ytdl-org/youtube-dl/releases/download/${json.tag_name}/MD5SUMS`;
                
                this.store.set("remoteVer", json.tag_name);
                this.store.set("remoteDlUrl", this.RemoteDownloadUrl);
                this.store.set("chsumDlUrl", this.ChecksumDownloadUrl);
            });
            //ローカル
            let vrcPath = this.store.get("vrcPath");
            let ytdl_path = '"' + vrcPath + '\\VRChat_Data\\StreamingAssets\\youtube-dl.exe"';
            
            this.exec(ytdl_path+" --version", (err, out, stderr) => {
                this.localVersion = out.replace(/\r?\n/g, '');;
                this.store.set("localVer", this.localVersion);
                if(err){
                    return reject("local check error");
                }else{
                    return resolve("version check done");
                }
            });
        });
    }

    md5hex(s) {
        let md5 = this.crypto.createHash('md5');
        return md5.update(s).digest('hex');
    }
}