module.exports = class CacheView{
    constructor(model){
        this.Model = model;

    }

    setView(arg){
        $("#path").text(arg.userFolder);
    }

    setUiEvents(){
        $(".bkup-path-add").on("click", ()=>{
            this.Model.onClickBuckupAddButton();
        });
        $("pic-bkup").on("click", ()=>{
            this.Model.buckupPic();
        });
    }




    setBuckupFolder(folders){
        $("#bkup-folder").empty();
        for(let i=0; i<folders.length; i++){
            let div = `
            <div class="row mx-2 mb-1 pb-1 bkup-path-${i}">
                <div class="col">${folders[i]}</div>
                <div class="col-1 float-right"><i id="${i}" class="fas fa-times px-1 clickable bkup-del"></i></div>
            </div>
            `;
            $("#bkup-folder").append(div);
        }
        $(".bkup-del").on("click", (e)=>{
            this.Model.onClickBuckupDeleteButton(e.target.id);
            $(".bkup-path-"+e.target.id).remove();
        });
    }

}