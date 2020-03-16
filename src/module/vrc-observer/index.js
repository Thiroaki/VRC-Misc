const exec = require("child_process").exec;
let cmd = 'tasklist | find "VRChat"';

module.exports = class VRCObserver{
    constructor(){
        this.isLaunch = false;
        this.__onLaunchCB = ()=>{};
        this.__onExitCB = ()=>{};

        setInterval(() => {
            exec(cmd, (err, out)=>{
                if(out){
                    if(this.isLaunch == false){
                        this.__onLaunchCB();
                    }
                    this.isLaunch = true;
                }else{
                    if(this.isLaunch == true){
                        this.__onExitCB();
                    }
                    this.isLaunch = false;
                }
            });
        }, 1000 * 5);
    }

    onLaunch(callback) {
        this.__onLaunchCB = callback;
    }

    onExit(callback){
        this.__onExitCB = callback;
    }

    clearOnLaunch(){
        this.__onLaunchCB = ()=>{};
    }

    clearOnExit(){
        this.__onExitCB = ()=>{};
    }
}