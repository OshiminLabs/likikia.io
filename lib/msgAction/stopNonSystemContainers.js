module.exports = function(obj,container,plugin,remoteFn){
    for(var i in container){
        if(!container[i].isSystem){
            container[i].disconnect();
            delete container[i];                                
        }
    }
}