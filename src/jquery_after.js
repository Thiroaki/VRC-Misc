if(typeof module === "object" && module.exports){
    window.$ = window.jQuery = module.exports; module.exports = {};
}

require("popper.js");
require("bootstrap");