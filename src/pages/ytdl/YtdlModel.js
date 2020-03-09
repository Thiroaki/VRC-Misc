module.exports = class YtdlModel{
    constructor(){
        this.exec = require('child_process').exec;
        this.YtdlView = require("./YtdlView");
        this.Store = require("electron-store");
        this.cron = require("node-cron");
        this.request = require("request");
        this.crypto = require('crypto');
        this.fs = require("fs");

        this.View = new this.YtdlView(this);
        this.store = new this.Store();

        this.remoteVersion = "";
        this.localVersion = "";
        this.RemoteDownloadUrl = "";
        this.ChecksumDownloadUrl = "";
        this.UpdateLocked = false;

        this.updateJob;

        // 起動時処理
        //this.checkYtdlVersion();

        if(this.store.get("ytdlJobStatus") != undefined && this.store.get("ytdlJobStatus")){
            this.createJob(this.store.get("ytdlJobText"), this.store.get("ytdlJobLimit"));
        }else{
            this.store.set("ytdlJobStatus", false);
        }
    }


    onSelect(){
        this.remoteVersion = this.store.get("remoteVer");
        this.localVersion = this.store.get("localVer");
        this.RemoteDownloadUrl = this.store.get("remoteDlUrl");
        this.ChecksumDownloadUrl = this.store.get("chsumDlUrl");

        this.View.setView();
        this.updateVersionInfo()
        this.setJobInfo();
    }


    async onClickUpdateButton(){
        if(!this.UpdateLocked){
            this.UpdateLocked = true;
            this.View.setUpdateButtonDisable();

            await this.checkYtdlVersion();
            await this.updateYtdl();

            setTimeout(() => {
                this.updateVersionInfo();
                this.View.setUpdateButtonEnable();
                this.UpdateLocked = false;
            }, 200);
        }
    }

    onRegistButton(cronText){
        if (this.cron.validate(cronText)){
            this.createJob(cronText);
        }
        this.setJobInfo();
    }
    onUnRegistButton(){
        this.destroyJob();
        this.setJobInfo();
    }



    createJob(cronText){
        this.store.set("ytdlJobText", cronText);
        this.store.set("ytdlJobStatus", true);

        if(this.updateJob != undefined){
            this.updateJob.destroy();
        }
        this.updateJob = this.cron.schedule(cronText, async ()=>{
            await this.checkYtdlVersion();
            await this.updateYtdl();
        });
        this.updateJob.start();
        console.log("Job started");
    }
    destroyJob(){
        this.store.set("ytdlJobStatus", false);
        if(this.updateJob != undefined){
            this.updateJob.destroy();
        }
        console.log("Job deleted");
    }

    setJobInfo(){
        let jobStatus = this.store.get("ytdlJobStatus");
        let span = this.store.get("ytdlJobText");

        if(jobStatus && span){
            this.View.setJobInfo(jobStatus, span);
        }
    }


    updateVersionInfo(){
        this.View.setVersion(this.remoteVersion, this.localVersion);
    }

    updateYtdl(){
        return new Promise((resolve, reject)=>{
            let ytdl_path = this.store.get("vrcPath") + "/VRChat_Data/StreamingAssets/youtube-dl.exe";
            let bkup_path = this.store.get("vrcPath") + `/VRChat_Data/StreamingAssets/youtube-dl_${this.localVersion}.exe`;
            let checksum;
            //チェックサム検証
            this.request({method:"get", url:this.ChecksumDownloadUrl}, (err,res,body)=>{
                if(err) reject("fail checksum download");

                checksum = body.match(/(\w|\d){30,}/g)[1];
                this.request({method:"get", url:this.RemoteDownloadUrl, encoding:null}, (err, res, body)=>{
                    if (err) reject("fail exe download");
                    
                    //リネームバックアップして保存
                    if(checksum == this.md5hex(body)){
                        this.fs.renameSync(ytdl_path, bkup_path);
                        this.fs.writeFileSync(ytdl_path, body, "binary");
                        this.localVersion = this.remoteVersion;
                    }
                    resolve("update done");
                });
            });
        });
    }

    checkYtdlVersion(){
        return new Promise((resolve, reject)=>{
            //リモート
            const ytdlUrl = "https://api.github.com/repos/ytdl-org/youtube-dl/releases/latest";
            $.getJSON(ytdlUrl, (json)=>{
                if(json.message)
                    this.remoteVersion = json.tag_name;
                    this.RemoteDownloadUrl = `https://github.com/ytdl-org/youtube-dl/releases/download/${json.tag_name}/youtube-dl.exe`;
                    this.ChecksumDownloadUrl = `https://github.com/ytdl-org/youtube-dl/releases/download/${json.tag_name}/MD5SUMS`;
                    
                    this.store.set("remoteVer", json.tag_name);
                    this.store.set("remoteDlUrl", this.RemoteDownloadUrl);
                    this.store.set("chsumDlUrl", this.ChecksumDownloadUrl);

            }).fail((jqXHR, textStatus, errorThrown)=>{
                reject("remote check error " + jqXHR.status);
            });
            //ローカル
            let vrcPath = this.store.get("vrcPath");
            let ytdl_path = vrcPath + "/VRChat_Data/StreamingAssets/youtube-dl.exe";
            this.exec(ytdl_path+" --version", (err, out, stderr) => {
                this.localVersion = out;
                this.store.set("localVer", out);
                if(err){
                    reject("local check error");
                }else{
                    resolve("version check done");
                }
            });
        });
    }

    md5hex(s) {
        let md5 = this.crypto.createHash('md5');
        return md5.update(s).digest('hex');
    }
}