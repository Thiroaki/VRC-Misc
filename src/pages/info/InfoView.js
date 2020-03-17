module.exports = class InfoView{
    constructor(model){
        this.model = model;
    }

    setView(){

    }

    setUiEvents(){
        $("#can-update .btn").on("click", ()=>{
            this.model.updateQuit();
        })
    }


    setVersion(v){
        $("#version").text(v);
    }

    setUpdateAvalable(){
        $("#can-update").show();
    }

}