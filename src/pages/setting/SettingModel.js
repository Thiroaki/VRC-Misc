module.exports = class SettingModel{
    constructor(){
        this.Store = require("electron-store");
        this.SettingView = require("./SettingView");
        this.dialog = require('electron').remote.dialog;
        this.View = new this.SettingView(this);
        this.store = new this.Store;

    }


    onSelect(){
            this.View.setUiEvents();

            let vrcPath = this.store.get("vrcPath");
            this.View.setVRCPath(vrcPath);
    }

    onClickChangeVRCPath(){
        let path = this.dialog.showOpenDialogSync(null, {
            properties: ['openDirectory'],
            defaultPath: '.'
        });
        this.updateVRCPath(path[0]);
    }

    updateVRCPath(newPath){
        this.store.set("vrcPath", newPath);
        this.View.setVRCPath(newPath);
    }
}