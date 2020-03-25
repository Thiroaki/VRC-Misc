module.exports = class CacheModel{
    constructor(){
        this.PicView = require("./PicView");
        this.Store = require("electron-store");
        this.cron = require("node-cron");
        this.ipcRenderer = require("electron").ipcRenderer;
        this.fs = require("fs-extra");

        this.View = new this.PicView(this);
        this.store = new this.Store();
        
        this.bkupDeleteLock = true;
        this.picBuckupJob;
        
        if(this.store.get("picBuckupJobStatus") != undefined && this.store.get("picBuckupJobStatus")){
            this.createJob(this.store.get("picBuckupJobText"), this.store.get("picBuckupJobLimit"));
        }else{
            this.store.set("picBuckupJobStatus", false);
        }

        this.picFolder = process.env['USERPROFILE'] + "\\Pictures\\VRChat";
    }


    onSelect(){
        this.setBuckupFolder();
        this.View.setView({userFolder:process.env["userprofile"]});
        this.View.setUiEvents();
    }


    onClickBuckupAddButton(){
        let path = this.ipcRenderer.sendSync("openDialogSelectDir", ".");
        this.addBuckupPath(path);
    }

    onClickBuckupDeleteButton(id){
        if(this.bkupDeleteLock){
            this.bkupDeleteLock = false;
            let folder = this.store.get("picBuckupFolder");
            folder.splice(id, 1);
            this.store.set("picBuckupFolder", folder);
            this.bkupDeleteLock = true;
            console.log(folder);
        }
    }

    async onClickBuckupButton(){
        console.log("click");
        
        this.View.setBkupButtonDisable();
        await this.buckupPicture();
        this.View.setBkupButtonEnable();
    }


    setBuckupFolder(){
        if(this.store.get("picBuckupFolder") != undefined){
            let folder = this.store.get("picBuckupFolder");
            console.log(folder);
            

            this.View.setBuckupFolder(folder);
        }else{
            this.View.setBuckupFolder([]);
        }
    }


    addBuckupPath(fpath){
        let bkupFolder;
        if(this.fs.statSync(fpath).isDirectory){
            if(this.store.get("picBuckupFolder") == undefined){
                bkupFolder = [fpath];
                this.store.set("picBuckupFolder", bkupFolder);
            }else{
                bkupFolder = this.store.get("picBuckupFolder");
                this.store.set("picBuckupFolder", bkupFolder.concat([fpath]));
            }
            
        }
        this.setBuckupFolder();
    }


    createJob(cronText){
        this.store.set("picBuckupJobText", cronText);
        this.store.set("picBuckupJobStatus", true);

        if(this.picBuckupJob != undefined){
            this.picBuckupJob.destroy();
        }
        this.picBuckupJob = this.cron.schedule(cronText, ()=>{
            this.buckupPicture();
        });
        this.picBuckupJob.start();
        console.log("Job started");
    }
    destroyJob(){
        this.store.set("picBuckupJobStatus", false);
        if(this.picBuckupJob != undefined){
            this.picBuckupJob.destroy();
        }
        console.log("Job deleted");
    }

    setJobInfo(){
        let jobStatus = this.store.get("picBuckupJobStatus");
        let span = this.store.get("picBuckupJobText");
        let limit = this.store.get("picBuckupJobPath");
        if(span && limit){
            this.View.setJobInfo(jobStatus, span, limit);
        }
    }

    buckupPicture(){
        return new Promise((resolve, reject) =>{
            console.log("bkup start");
            
            if(this.store.get("picBuckupFolder") == undefined){
                return reject("Folder not set");
            }

            
            let buckupFolder = this.store.get("picBuckupFolder");
            let finishCount = 0;

            buckupFolder.forEach((e)=>{
                this.fs.copy(this.picFolder, e, {overwrite:false,preserveTimestamps:true})
                .then(()=>{ finishCount++ })
                .catch(()=>{ finishCount++ });
            });

            let finish = ()=>{
                setTimeout(() => {
                    if(finishCount += buckupFolder.length){
                        console.log("bkup finish");
                        return resolve("bkup finish");
                    }else{
                        finish();
                    }
                }, 1000);
            }
            finish();
        });
    }

    gatherPicture(){
        
    }
}