//Arrête tous les containers d'une ou plusieurs catégories passées en paramètre

module.exports =  function(obj,container,plugin,remoteFn){
    console.log("stopCatContainers",obj.catNames);
    obj.catNames = Array.isArray(obj.catNames) ? obj.catNames : [obj.catNames];
    for(var i in container){
        if(path.basename(path.dirname(i)) != "system" && obj.catNames.indexOf(container[i].config.categorie) !== -1 && container[i].config.localName !== plugin.localName){
            container[i].disconnect();
            delete container[i];
        }
    }
    if (obj.catNames.indexOf(plugin.categorie) !== -1 && path.basename(path.dirname(plugin.path)) != "system") {
        this.disconnect();
        delete container[i];
    }
    this.sendMessage({
        fromUuid : obj.uuid,
        result : true,
        error :  null         
    });

/*var stopDepends = function(containerList,pluginName){
        if(containerList[pluginName].config.depends){
            for (var i in dependances){
                containerList.filter(processItem=>{
                    if(processItem.match(''))
                })
                for(var j in containerList){
                    if(path.basename(path.dirname(i)) != "system"  obj.catNames.indexOf(container[i].config.categorie) !== -1 && container[i].config.localName !== plugin.localName)
                    
                }
            
            }
        }
}
*/
