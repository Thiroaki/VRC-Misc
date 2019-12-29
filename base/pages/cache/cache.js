var fs = require('fs');
var path = require('path');


$(function(){
    // ドロップダウンリスト設定
    for(let i=0; i<24; i++){
        $("#hour").append("<option value="+i+">"+i+"時</option>");
    }
    for(let i=0; i<60; i+=10){
        $("#minute").append("<option value="+i+">"+i+"分</option>");
    }

    // キャッシュ情報セット    
    setCacheInfo("#total-count", "#total-size");

});

$("#clear-now").on("click", function(){
    let limitDay = $("#limit-day").val();
    l(limitDay);
});

$("#cache-schedule-info").on("click", function(){
    
});




function l(arg) {console.log(arg)}