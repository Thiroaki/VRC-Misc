module.exports = class YtdlView{
    constructor(model){
        this.model = model;
    }

    setVersion(remote, local){
        $("#remotever").text(remote);
        $("#localver").text(local);
    }

    setView(){
        if($("#month").val() == "m"){
            $("#month").after('<select id="times"></select>');
            for(let i=1; i<31; i++){
                $("#times").append("<option value="+i+">"+i+"日</option>");
            }
        }
        
    
        for(let i=0; i<24; i++){
            $("#hour").append("<option value="+i+">"+i+"時</option>");
        }
        for(let i=0; i<60; i+=10){
            $("#minute").append("<option value="+i+">"+i+"分</option>");
        }
    
    }

}