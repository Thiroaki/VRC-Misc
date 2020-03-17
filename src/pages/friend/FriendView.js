module.exports = class FriendView{
    constructor(model){
        this.ipcRenderer = require("electron").ipcRenderer;
        this.Model = model;
        this.logPath = "";
    }

    setView(){

    }

    setUiEvents(){
        $("#change-log-save-dir").on("click", ()=>{
            let path = this.ipcRenderer.sendSync("openDialogSelectDir", ".");
            this.logPath = path;
            $("#log-save-dir").text(path);
            this.changeSaveLogParam();
        });
        $("#save-log").on("change", ()=>{
            this.changeSaveLogParam();
        });
    }

    
    changeSaveLogParam(){
        let bool = $("#log-switch input[type='checkbox']").prop('checked');
        let DCL = $("#log-dcl").val();
        let path = this.logPath;
        this.Model.onChangeLogParam(bool, DCL, path);
    }

    setSaveLogParam(status, DCL, path){
        $("#log-switch input[type='checkbox']").prop('checked', status);
        $("#log-dcl").val(DCL);
        $("#log-save-dir").text(path);
        this.logPath = path;
    }

}