const path = require("path");
module.exports = function(obj,container,plugin,remoteFn){
    for(var i in container){
        if(path.basename(path.dirname(i)) != "system"){
            container[i].disconnect();
            delete container[i];                                
        }
    }
}