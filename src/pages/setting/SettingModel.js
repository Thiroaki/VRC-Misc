module.exports = class SettingModel{
    constructor(){
        this.Store = require("electron-store");
        this.SettingView = require("./SettingView");
        this.ipcRenderer = require('electron').ipcRenderer;
        this.View = new this.SettingView(this);
        this.store = new this.Store;

    }


    onSelect(){
            this.View.setUiEvents();

            let vrcPath = this.store.get("vrcPath");
            this.View.setVRCPath(vrcPath);
    }

    onClickChangeVRCPath(){
        let path = this.ipcRenderer.sendSync("openDialogSelectDir", "C:\\");
        if(path) this.updateVRCPath(path);
    }

    updateVRCPath(newPath){
        this.store.set("vrcPath", newPath);
        this.View.setVRCPath(newPath);
    }
}