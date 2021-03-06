module.exports = class YtdlView{
    constructor(model){
        this.electron = require("electron");
        this.Model = model;
    }

    setView(){
        for(let i=0; i<24; i++){
            $("#job-hour").append(`<option value="${i}">${i}時</option>`);
        }

    }

    setUiEvents(){
        //情報
        $("#ytdl-update").on("click", ()=>{
            this.Model.onClickUpdateButton();
        });
        $("#ytdl-verify").on("click", ()=>{
            this.electron.shell.openExternal("https://note.com/okouu/n/n632ed8690706");
        });

        //定期実行
        $("#job-switch input[type='checkbox']").on("change", ()=>{
            this.changeJobParam();
        });
        $("#job-param").on("change", ()=>{
            this.changeJobParam();
        });

    }

    changeJobParam(){
        let status = $("#job-switch input[type='checkbox']").prop('checked');
        let month = $('#job-month').val();
        let hour = $('#job-hour').val();
        this.Model.onChangeUpdateJobParam(status, month, hour);
    }

    setVersion(remote, local){
        $("#remotever").text(remote);
        $("#localver").text(local);
    }

    setJobInfo(status, month, hour){
        $('#job-month').val(month);
        $('#job-hour').val(hour);

        if(status){
            $("#job-switch input[type='checkbox']").prop('checked', true);
        }        
    }

    setUpdateButtonEnable(){
        $("#ytdl-update").prop("disabled", false);
        $("#ytdl-update > #ytdl-disable").hide();
        $("#ytdl-update > #ytdl-enable").fadeIn(200);
    }
    setUpdateButtonDisable(){
        $("#ytdl-update").prop("disabled", true);
        $("#ytdl-update > #ytdl-enable").hide();
        $("#ytdl-update > #ytdl-disable").fadeIn(200);
    }

}