module.exports = class CacheView{
    constructor(model){
        this.model = model;

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
        $("#cache-regist").on("click", ()=>{
            let limit = $('input[name="limit"').val();
            let month = $('input[name="month"]').val();
            let week = $('input[name="week"]').val();
            let day = $('input[name="day"]').val();
            let hour = $('input[name="hour"]').val();
            let minute = $('input[name="minute"]').val();
            let regex = /^(\d|,|-|\*)*$/;

            if(regex.test(month)&&regex.test(week)&&regex.test(day)&&regex.test(hour)&&regex.test(minute)){
                let cronText = minute +" "+ hour +" "+ day +" "+ month +" "+ week;
                this.model.onRegistButton(cronText, limit);
            }else{
                $("#input-error").fadeIn(200, ()=>{
                    setTimeout(()=>{
                        $("#input-error").fadeOut(200);
                    }, 4000);
                });
            }
        });

        $("#cache-unregist").on("click", ()=>{
            this.model.onUnRegistButton();
        });
    }

    setView(){
        
    }

    setLimitDay(limit){
        $("#limit-day").val(limit);
    }

    setCacheInfo(count, size){
        $("#total-count").text(count);
        $("#total-size").text(size);
    }

    setJobInfo(jobStatus, span, limit){
        let d = span.split(" ");
        $('input[name="limit"]').val(limit);
        $('input[name="month"]').val(d[4]);
        $('input[name="week"]').val(d[3]);
        $('input[name="day"]').val(d[2]);
        $('input[name="hour"]').val(d[1]);
        $('input[name="minute"]').val(d[0]);

        if(jobStatus){
            $("#cache-span").text(span);
            $("#cache-limit").text(limit+"日");
        }else{
            $("#cache-span").text("");
            $("#cache-limit").text("");
        }
        console.log(jobStatus);
        
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
