module.exports = class YtdlView{
    constructor(model){
        this.Model = model;
    }

    setVersion(remote, local){
        $("#remotever").text(remote);
        $("#localver").text(local);
    }

    setView(){
        //情報
        $("#ytdl-update").on("click", ()=>{
            this.Model.onClickUpdateButton();
        });

        //定期実行
        $("#ytdl-regist").on("click", ()=>{
            let month = $('input[name="month"]').val();
            let week = $('input[name="week"]').val();
            let day = $('input[name="day"]').val();
            let hour = $('input[name="hour"]').val();
            let minute = $('input[name="minute"]').val();
            let regex = /^(\d|,|\*)*$/;

            if(regex.test(month)&&regex.test(week)&&regex.test(day)&&regex.test(hour)&&regex.test(minute)){
                let cronText = minute +" "+ hour +" "+ day +" "+ month +" "+ week;
                this.Model.onRegistButton(cronText);
            }else{
                $("#input-error").fadeIn(200, ()=>{
                    setTimeout(()=>{
                        $("#input-error").fadeOut(200);
                    }, 4000);
                });
            }
        });
    }

    setUpdateButtonEnable(){
        $("#ytdl-update").prop("disabled", false);
        $("#ytdl-update > #ytdl-disable").hide();
        $("#ytdl-update > #ytdl-enable").fadeIn(200);
    }
    setUpdateButtonDisable(){
        $("#ytdl-update").prop("disabled", true);
        $("#ytdl-update > #ytdl-enable").hide();
        $("#ytdl-update > #ytdl-disable").fadeIn(200);
    }

}