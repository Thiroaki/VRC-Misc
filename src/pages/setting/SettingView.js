module.exports = class SettingView{
    constructor(model){
        this.model = model;
    }


    setUiEvents(){
        // vrcパス変更ボタン
        $(document).on("click", ".change-path", ()=>{
            this.model.onClickChangeVRCPath();
        });
    }

    setVRCPath(path){
        $("#vrc-place").text(path);
    }

    

}