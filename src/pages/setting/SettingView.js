module.exports = class SettingView{
    constructor(model){
        this.model = model;
    }


    setUiEvents(){
        // vrcパス変更ボタン
        $("#change-vrc-path").on("click", ()=>{
            this.model.onClickChangeVRCPath();
        });
    }

    setVRCPath(path){
        $("#vrc-place").text(path);
    }

    

}