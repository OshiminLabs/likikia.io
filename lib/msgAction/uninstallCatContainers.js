const fsExtra = require('fs-extra');
module.exports = function(obj,container,plugin,remoteFn,loadPlugin){
    obj.catNames = Array.isArray(obj.catNames) ? obj.catNames : [obj.catNames];
    for(var i in container){
        if(!container[i].isSystem && obj.catNames.indexOf(container[i].config.categorie) !== -1 ){
            console.log('in message action');
                container[i].gracefullyStop();
                fsExtra.remove(container[i].config.path,(err)=>{
                    if (err) return console.error(err);
                });
                console.log('avant desins');
                delete container[i];
        }
    }
    this.sendMessage({
        fromUuid : obj.uuid,
        result : true,
        error :  null         
    });

}