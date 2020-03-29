module.exports = class CacheModel{
    constructor(){
        this.PicView = require("./PicView");
        this.Store = require("electron-store");
        this.cron = require("node-cron");
        this.ipcRenderer = require("electron").ipcRenderer;
        this.fs = require("fs-extra");
        this.path = require("path");
        this.chokidar = require("chokidar");
        this.dateformat = require("dateformat");

        this.View = new this.PicView(this);
        this.store = new this.Store();
        
        this.bkupDeleteLock = true;
        this.picBuckupJob;
        this.watcher;
        
        // if(this.store.get("picBuckupJobStatus") != undefined && this.store.get("picBuckupJobStatus")){
        //     this.createJob(this.store.get("picBuckupJobText"), this.store.get("picBuckupJobLimit"));
        // }else{
        //     this.store.set("picBuckupJobStatus", false);
        // }

        if(this.store.get("picSortStatus") != undefined && this.store.get("picSortStatus")){
            this.setSortJob();
        }

        this.picFolder = process.env['USERPROFILE'] + "\\Pictures\\VRChat";
    }


    onSelect(){
        this.View.setView({userFolder:process.env["userprofile"]});
        this.View.setUiEvents();
        this.setBuckupParam();
        this.setSortInfo();
    }


    onClickBuckupAddButton(){
        let path = this.ipcRenderer.sendSync("openDialogSelectDir", "C:\\");
        if(path) this.addBuckupPath(path);
    }

    onClickBuckupDeleteButton(id){
        if(this.bkupDeleteLock){
            this.bkupDeleteLock = false;
            let folder = this.store.get("picBuckupSrcPath");
            folder.splice(id, 1);
            this.store.set("picBuckupSrcPath", folder);
            this.bkupDeleteLock = true;
            console.log(folder);
        }
    }

    onChangeBuckupDistPath(path){
        this.store.set("picBuckupDistPath", path);
    }

    onChangeBuckupKeep(bool){
        this.store.set("picBuckupKeep", bool);
        console.log(bool);
        
    }


    onChangeSortParam(status, DCL, dir){
        if(DCL && dir != undefined){
            this.store.set("picSortStatus", status);
            this.store.set("picSortDCL", DCL);
            this.store.set("picSortDir", dir);
            console.log(status, DCL, dir);
            
        }
        if(status && dir){
            this.setSortJob();
        }
        if(!status){
            this.unsetSortJob();
        }
    }






    async onClickBuckupButton(){
        this.View.setBkupButtonDisable();
        await this.buckupPicture()
        .then((v)=>{ console.log(v) })
        .catch((v)=>{ console.log(v) });
        this.View.setBkupButtonEnable();
    }


    setBuckupParam(){
        let srcPaths = this.store.get("picBuckupSrcPath");
        let distPath = this.store.get("picBuckupDistPath");
        let keep = this.store.get("picBuckupKeep");
        if(!srcPaths) srcPaths = [];
        if(!distPath) distPath = "";
        this.View.setBuckupParam(srcPaths, distPath, keep);
    }

    setSortInfo(){
        let status = this.store.get("picSortStatus");
        let dcl = this.store.get("picSortDCL");
        let dir = this.store.get("picSortDir");
        this.View.setPicSortParam(status, dcl, dir);
    }

    addBuckupPath(fpath){
        let bkupFolder;
        if(this.fs.statSync(fpath).isDirectory()){
            if(this.store.get("picBuckupSrcPath") == undefined){
                bkupFolder = [fpath];
                this.store.set("picBuckupSrcPath", bkupFolder);
            }else{
                bkupFolder = this.store.get("picBuckupSrcPath");
                this.store.set("picBuckupSrcPath", bkupFolder.concat([fpath]));
            }
            
        }
        this.setBuckupParam();
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
            let buckupSrcFolder = this.store.get("picBuckupSrcPath");
            let distFolder = this.store.get("picBuckupDistPath");
            if(buckupSrcFolder == undefined || distFolder == undefined){
                console.log("folder is not set");
                
                return reject("Folder not set");
            }

            let promiseArr = [];
            for (const folder of buckupSrcFolder){
                let bkup = (src)=>{
                    return new Promise((resolve,reject)=>{
                        let dist = distFolder;
                        if(this.store.get("picBuckupKeep")){
                            dist = this.path.join(distFolder, this.path.basename(src));
                        }
                        this.fs.copy(src, dist, {overwrite:false,preserveTimestamps:true})
                        .then(()=>{
                            console.log("bkup folder ok");
                            
                            resolve()})
                        .catch(()=>{
                            reject("buckup copy faild");
                        });
                    });
                };
                promiseArr.push(bkup(folder));
            }
            Promise.all(promiseArr).then(()=>{
                resolve("buckup finished");
            }).catch(()=>{
                reject("buckup error");
            });
        });
    }

    sortPicture(file){
        const DCL = this.store.get("picSortDCL");
        
        let stat = this.fs.statSync(file);
        if(stat.isFile){
            let d = new Date(stat.birthtimeMs);
            d.setHours(d.getHours() - DCL);
            let dirname = this.dateformat(d, 'yyyy-mm-dd');
            this.fs.move(file, this.path.join(this.path.dirname(file), dirname, this.path.basename(file)), err=>{
                if (err) console.log(err);
            });
            console.log(this.path.dirname(file), dirname, this.path.basename(file));
        }
    }

    setSortJob(){
        let dir = this.store.get("picSortDir");
        if (this.watcher) this.watcher.close();
        this.watcher = this.chokidar.watch(dir, {ignored: /[\/\\]\./, depth:0});

        this.watcher.on("add", (path)=>{
            this.sortPicture(path);
        });
    }
    unsetSortJob(){
        if(this.watcher) this.watcher.close();
    }
}