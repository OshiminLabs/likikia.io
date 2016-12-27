module.exports = function(obj,container,plugin,remoteFn){
    
    require(path.join(__dirname,"stopContainer.js")).call(this,obj,container,plugin,remoteFn,module.exports);
    
    for(var i in container){
        if(!container[i].isSystem && container[i].config.localName == obj.localName){
            container[i].disconnect();
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