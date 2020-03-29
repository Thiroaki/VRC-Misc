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
        this._mlogger = require("../../module/mlogger/index");

        this.View = new this.PicView(this);
        this.store = new this.Store();
        this.logger = new this._mlogger("pic");
        
        this.bkupDeleteLock = true;
        this.picBackupJob;
        this.watcher;
        
        // if(this.store.get("picBackupJobStatus") != undefined && this.store.get("picBackupJobStatus")){
        //     this.createJob(this.store.get("picBackupJobText"), this.store.get("picBackupJobLimit"));
        // }else{
        //     this.store.set("picBackupJobStatus", false);
        // }

        if(this.store.get("picSortStatus") != undefined && this.store.get("picSortStatus")){
            this.setSortJob();
        }

        this.picFolder = process.env['USERPROFILE'] + "\\Pictures\\VRChat";
    }


    onSelect(){
        this.View.setView({userFolder:process.env["userprofile"]});
        this.View.setUiEvents();
        this.setBackupParam();
        this.setSortParam();
    }


    onClickBackupAddButton(){
        let path = this.ipcRenderer.sendSync("openDialogSelectDir", "C:\\");
        if(path) this.addBackupPath(path);
    }

    onClickBackupDeleteButton(id){
        if(this.bkupDeleteLock){
            this.bkupDeleteLock = false;
            let folder = this.store.get("picBackupSrcPath");
            folder.splice(id, 1);
            this.store.set("picBackupSrcPath", folder);
            this.bkupDeleteLock = true;
        }
    }

    onChangeBackupDistPath(path){
        this.store.set("picBackupDistPath", path);
    }

    onChangeBackupKeep(bool){
        this.store.set("picBackupKeep", bool);
        this.logger.debug(bool);
        
    }


    onChangeSortParam(status, DCL, dir){
        this.logger.info("sort param change:", status, DCL, dir);
        if(DCL && dir != undefined){
            this.store.set("picSortStatus", status);
            this.store.set("picSortDCL", DCL);
            this.store.set("picSortDir", dir);
        }
        if(status && dir){
            this.setSortJob();
        }
        if(!status){
            this.unsetSortJob();
        }
    }






    async onClickBackupButton(){
        this.View.setBkupButtonDisable();
        await this.backupPicture();
        this.View.setBkupButtonEnable();
    }


    setBackupParam(){
        let srcPaths = this.store.get("picBackupSrcPath");
        let distPath = this.store.get("picBackupDistPath");
        let keep = this.store.get("picBackupKeep");
        if(!srcPaths) srcPaths = [];
        if(!distPath) distPath = "";
        this.View.setBackupParam(srcPaths, distPath, keep);
        this.logger.info("backup param:", srcPaths, distPath, keep);
    }

    setSortParam(){
        let status = this.store.get("picSortStatus");
        let dcl = this.store.get("picSortDCL");
        let dir = this.store.get("picSortDir");
        this.View.setPicSortParam(status, dcl, dir);
        this.logger.info("sort param set:", status, DCL, dir);
    }

    addBackupPath(fpath){
        let bkupFolder;
        if(this.fs.statSync(fpath).isDirectory()){
            if(this.store.get("picBackupSrcPath") == undefined){
                bkupFolder = [fpath];
                this.store.set("picBackupSrcPath", bkupFolder);
            }else{
                bkupFolder = this.store.get("picBackupSrcPath");
                this.store.set("picBackupSrcPath", bkupFolder.concat([fpath]));
            }
            
        }
        this.setBackupParam();
    }


    createJob(cronText){
        this.store.set("picBackupJobText", cronText);
        this.store.set("picBackupJobStatus", true);

        if(this.picBackupJob != undefined){
            this.picBackupJob.destroy();
        }
        this.picBackupJob = this.cron.schedule(cronText, ()=>{
            this.backupPicture();
        });
        this.picBackupJob.start();
        this.logger.debug("Job started");
    }
    destroyJob(){
        this.store.set("picBackupJobStatus", false);
        if(this.picBackupJob != undefined){
            this.picBackupJob.destroy();
        }
        this.logger.debug("Job deleted");
    }

    setJobInfo(){
        let jobStatus = this.store.get("picBackupJobStatus");
        let span = this.store.get("picBackupJobText");
        let limit = this.store.get("picBackupJobPath");
        if(span && limit){
            this.View.setJobInfo(jobStatus, span, limit);
        }
    }

    backupPicture(){
        return new Promise((resolve, reject) =>{
            this.logger.info("Picture backup start");
            let backupSrcFolder = this.store.get("picBackupSrcPath");
            let distFolder = this.store.get("picBackupDistPath");
            let isKeep = this.store.get("picBackupKeep");
            this.logger.info(backupSrcFolder, distFolder, isKeep);

            if(backupSrcFolder == undefined || distFolder == undefined){
                this.logger.error("folder wasn't set");
                return reject("Folder not set");
            }

            let promiseArr = [];
            for (const folder of backupSrcFolder){
                let bkup = (src)=>{
                    return new Promise((resolve,reject)=>{
                        let dist = distFolder;
                        if(isKeep){
                            dist = this.path.join(distFolder, this.path.basename(src));
                        }
                        this.fs.copy(src, dist, {overwrite:false,preserveTimestamps:true})
                        .then(()=>{
                            this.logger.debug("bkup folder ok");
                            resolve()})
                        .catch((err)=>{
                            this.logger.error(err);
                            reject("backup copy faild");
                        });
                    });
                };
                promiseArr.push(bkup(folder));
            }
            Promise.all(promiseArr).then(()=>{
                this.logger.info("Backup finish");
                resolve("backup finished");
            }).catch(()=>{
                this.logger.error("Backup error");
                reject("backup error");
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
                if (err) this.logger.error(err);
            });
            this.logger.debug(this.path.dirname(file), dirname, this.path.basename(file));
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