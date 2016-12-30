const fsExtra = require('fs-extra');
module.exports = function(obj,container,plugin,remoteFn,loadPlugin){
    for(var i in container){
        console.log('unins');   
        if(!container[i].isSystem){
            container[i].gracefullyStop();
            fsExtra.remove(container[i].config.path,(err)=>{
                if (err) return console.error(err);
            });
            delete container[i];
        }
    }

}