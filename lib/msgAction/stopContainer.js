module.exports = function(obj,container,plugin,remoteFn){
    for(var i in container){
        if(!container[i].isSystem && container[i].config.localName == obj.localName){
            container[i].gracefullyStop();
            delete container[i];
            break;
        }
    }
    this.sendMessage({
        fromUuid : obj.uuid,
        result : true,
        error :  null         
    });
}