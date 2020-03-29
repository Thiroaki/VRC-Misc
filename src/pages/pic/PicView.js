module.exports = class CacheView{
    constructor(model){
        this.ipcRenderer = require("electron").ipcRenderer;
        this.Model = model;
    }

    setView(arg){
        $("#path").text(arg.userFolder);
    }

    setUiEvents(){
        $("#bkup-path-add").on("click", ()=>{
            this.Model.onClickBackupAddButton();
        });
        $("#pic-bkup").on("click", ()=>{
            this.Model.onClickBackupButton();
        });
        $("#change-bkup-dist-path").on("click", ()=>{
            let path = this.ipcRenderer.sendSync("openDialogSelectDir", "C:\\");
            if(path){
                $("#bkup-dist-path").text(path);
                this.Model.onChangeBackupDistPath(path);
            }
        });
        $("#bkup-keep-switch").on("change", ()=>{
            let bool = $("#bkup-keep-switch input[type='checkbox']").prop("checked");
            this.Model.onChangeBackupKeep(bool);
        });


        $("#change-pic-sort-dir").on("click", ()=>{
            let path = this.ipcRenderer.sendSync("openDialogSelectDir", process.env['USERPROFILE'] + "\\Pictures");
            if(path){
                $("#pic-sort-dir").text(path);
                this.changePicSortParam();
            }
        });
        $("#pic-sort").on("change", ()=>{
            this.changePicSortParam();
        });
    }

    changePicSortParam(){
        let status = $("#pic-sort-switch input[type='checkbox']").prop('checked');
        let dcl = $("#pic-dcl").val();
        let path = $("#pic-sort-dir").text();
        this.Model.onChangeSortParam(status, dcl, path);
    }


    setBackupParam(srcPaths, distPath, keep){
        $("#bkup-folder").empty();
        for(let i=0; i<srcPaths.length; i++){
            let div = `
            <div id="bkup-src-path-${i}" class="row mx-1 mb-1 pb-1">
                <div class="col px-2"><span>${srcPaths[i]}</span></div>
                <div class="col-1 float-right"><i id="${i}" class="fas fa-times px-1 clickable bkup-del"></i></div>
            </div>
            `;
            $("#bkup-folder").append(div);
        }
        $(".bkup-del").on("click", (e)=>{
            this.Model.onClickBackupDeleteButton(e.target.id);
            $("#bkup-src-path-"+e.target.id).remove();
        });
        $("#bkup-dist-path").text(distPath);
        $("#bkup-keep-switch input[type='checkbox']").prop("checked", keep);
    }

    setBkupButtonEnable(){
        $("#pic-bkup").prop("disabled", false);
        $("#pic-bkup > #btn-disable").hide();
        $("#pic-bkup > #btn-enable").fadeIn(200);
    }
    setBkupButtonDisable(){
        $("#pic-bkup").prop("disabled", true);
        $("#pic-bkup > #btn-enable").hide();
        $("#pic-bkup > #btn-disable").fadeIn(200);
    }

    
    setPicSortParam(status, dcl, path){
        $("#pic-sort-switch input[type='checkbox']").prop('checked', status);
        $("#pic-dcl").val(dcl);
        $("#pic-sort-dir").text(path);
    }
}