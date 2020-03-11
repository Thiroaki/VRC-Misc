module.exports = class InfoModel{
    constructor(){
        this.fs = require("fs");
        this._Store = require("electron-store");
        this.InfoView = require("./InfoView");
        this.View = new this.InfoView(this);
        this.store = new this._Store;

        this.appVersion = "";
    }

    onSelect(){
        this.View.setView();
        this.View.setUiEvents();
        this.setVersion();
    }

    setVersion(){
        this.View.setVersion(this.appVersion);
    }

    
}