module.exports = function(obj,container,plugin,remoteFn){
    obj.localNames = Array.isArray(obj.localNames) ? obj.localNames : [obj.localNames];
    for(var i in container){
        if(!container[i].isSystem && obj.localNames.indexOf(container[i].config.localName) !== -1 ){
            container[i].disconnect();
            delete container[i];
        }
    }
    this.sendMessage({
        fromUuid : obj.uuid,
        result : true,
        error :  null         
    });
}