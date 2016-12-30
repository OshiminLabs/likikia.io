//Arrête tous les containers d'une ou plusieurs catégories passées en paramètre

module.exports =  function(obj,container,plugin,remoteFn){
    console.log("stopCatContainers",obj.catNames);
    console.log("stopCatContainers",container.length);
    obj.catNames = Array.isArray(obj.catNames) ? obj.catNames : [obj.catNames];
    for(var i in container){
        if(!container[i].isSystem && obj.catNames.indexOf(container[i].config.categorie) !== -1 ){
            container[i].gracefullyStop();
            delete container[i];
        }
    }

    this.sendMessage({
        fromUuid : obj.uuid,
        result : true,
        error :  null         
    });
};
