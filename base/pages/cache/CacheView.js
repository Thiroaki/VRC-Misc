module.exports = class CacheView{
    constructor(presenter){
        this.presenter = presenter;

    }

    onCacheDeleteButtonPress() {
        this.presenter.onButtonPress();        
    }

    test(txt) {
        console.log(txt);
    }

    setUiEvents(){
        $(document).on("click", "#clear-now", ()=>{
            this.onCacheDeleteButtonPress();
        });

        console.log("called setUiEvents");
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
