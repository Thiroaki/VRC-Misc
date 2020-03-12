module.exports = class CacheView{
    constructor(model){
        this.model = model;

    }

    setView(){
        for(let i=0; i<24; i++){
            $("#job-hour").append(`<option value="${i}">${i}時</option>`);
        }
    }

    setUiEvents(){
        //キャッシュ情報
        $("#cache-clear").on("click", ()=>{
            this.model.onClearButtonPress($("#limit-day").val());
        });
        $("#limit-day").on("change", ()=>{
            this.model.onLimitDayChanged($("#limit-day").val());
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
        let limit = $('#job-limit').val();
        let month = $('#job-month').val();
        let hour = $('#job-hour').val();
        this.model.onRegist(status, month, hour, limit);
    }


    setLimitDay(limit){
        if(limit) $("#limit-day").val(limit);
    }

    setCacheInfo(count, size){
        $("#total-count").text(count);
        $("#total-size").text(size);
    }

    setJobInfo(status, month, hour, limit){
        $("#job-month").val(month);
        $("#job-hour").val(hour);
        $("#job-limit").val(limit);

        if(status){
            $("#job-switch input[type='checkbox']").prop('checked', true);
        }
        console.log(status);
        
    }

    setClearButtonEnable(){
        $("#cache-clear").prop("disabled", false);
        $("#cache-clear > .btn-disable").hide();
        $("#cache-clear > .btn-enable").fadeIn(200);
    }
    setClearButtonDisable(){
        $("#cache-clear").prop("disabled", true);
        $("#cache-clear > .btn-enable").hide();
        $("#cache-clear > .btn-disable").fadeIn(200);
    }
}
