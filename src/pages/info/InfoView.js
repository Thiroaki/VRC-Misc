module.exports = class InfoView{
    constructor(model){
        this.model = model;
    }

    setView(){

    }

    setUiEvents(){
        // vrcパス変更ボタン
        $("#change-vrc-path").on("click", ()=>{
            this.model.onClickChangeVRCPath();
        });
    }


    setVersion(v){
        $("#version").text(v);
    }

    setUpdateAvalable(){
        $("#can-update").show();
    }

}