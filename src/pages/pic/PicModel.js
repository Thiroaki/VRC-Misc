module.exports = class CacheModel{
    constructor(){
        this.PicView = require("./PicView");
        this.Store = require("electron-store");
        this.cron = require("node-cron");
        this.dialog = require("electron").remote.dialog;
        this.fs = require("fs");

        this.View = new this.PicView(this);
        this.store = new this.Store();
        
        this.bkupDeleteLock = true;
    }


    onSelect(){
        this.setBuckupFolder();
        this.View.setView();
        this.View.setUiEvents();
    }


    onClickBuckupAddButton(){
        let path = this.dialog.showOpenDialogSync(null, {
            properties: ['openDirectory'],
            defaultPath: '.'
        });
        this.addBuckupPath(path[0]);
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
}