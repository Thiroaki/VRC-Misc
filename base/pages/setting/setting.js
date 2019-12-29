$(document).on("click", "#select-vrc", function(){
    var path = dialog.showOpenDialogSync(null, {
        properties: ['openDirectory'],
        defaultPath: '.'
    });
    $("#vrc-place").text(path[0]);
});