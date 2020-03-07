module.exports = class CacheView{
    constructor(model){
        this.model = model;

    }

    setUiEvents(){
        $(document).on("click", "#clear-now", ()=>{
            this.model.onClearButtonPress();
        });

        $(document).on("click", "#limit-day", ()=>{
            this.model.onLimitDayChanged();
        });
    }

    setView(){
        for(let i=0; i<24; i++){
            $("#hour").append("<option value="+i+">"+i+"時</option>");
        }
        for(let i=0; i<60; i+=10){
            $("#minute").append("<option value="+i+">"+i+"分</option>");
        }
    
    }

    setCacheInfo(count, size){
        $("#total-count").text(count);
        $("#total-size").text(size);
    }
}
