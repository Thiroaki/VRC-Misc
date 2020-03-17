module.exports = class InfoModel{
    constructor(){
        this.remote =  require("electron").remote;
        this.ipcRenderer = require("electron").ipcRenderer;
        this.fs = require("fs");
        this._Store = require("electron-store");
        this.InfoView = require("./InfoView");
        this.View = new this.InfoView(this);
        this.store = new this._Store;

        this.ipcRenderer.on("setUpdateAvalable", (e, arg)=>{
            this.updateAvalable = true;
        });
    }

    onSelect(){
        this.View.setView();
        this.View.setUiEvents();
        this.setVersion();
        this.setUpdateAvalable();
    }

    setVersion(){
        this.View.setVersion("v"+this.remote.app.getVersion());
    }

    setUpdateAvalable(){
        if(this.updateAvalable){
            this.View.setUpdateAvalable();
        }
    }

    updateQuit(){
        this.ipcRenderer.send("updateQuit");
    }
    
}