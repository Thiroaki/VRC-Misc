module.exports = class FriendView{
    constructor(model){
        this.dialog = require('electron').remote.dialog;
        this.Model = model;
        this.logPath = "";
    }

    setView(){

    }

    setUiEvents(){
        $("#change-log-save-dir").on("click", ()=>{
            let path = this.dialog.showOpenDialogSync(null, {
                properties: ['openDirectory'],
                defaultPath: 'C:\\'
            });
            this.logPath = path[0];
            $("#log-save-dir").text(path[0]);
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