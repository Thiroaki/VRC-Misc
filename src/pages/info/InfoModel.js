module.exports = class InfoModel{
    constructor(){
        this.remote =  require("electron").remote;
        this.fs = require("fs");
        this._Store = require("electron-store");
        this.InfoView = require("./InfoView");
        this.View = new this.InfoView(this);
        this.store = new this._Store;
    }

    onSelect(){
        this.View.setView();
        this.View.setUiEvents();
        this.setVersion();
    }

    setVersion(){
        this.View.setVersion("v"+this.remote.app.getVersion());
    }

    
}