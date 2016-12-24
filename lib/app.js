const EventEmitter = require('events');

class app extends EventEmitter {
  constructor() {
    super();
  }
}

appObj = new app;
buildProxy = (parent,app)=>{

    var handler = {
        get: function(cible, nom){
            var fnName = (parent?(parent+".") : "")+nom.toString().replace(/^Symbol\(/,"").replace(/\)$/,"");
            return nom in cible?
                cible[nom] :
                buildProxy(fnName,function(){
                    var arg = Array.prototype.slice.call(arguments);
                    return new Promise(function(resolve,reject){
                        process.sendMessage({
                            action : "call",
                            function : fnName
                        }).then(resolve).catch(reject);
                    });
                    return 33;
                });
        }
    };
    return new Proxy(app, handler);
}
module.exports = buildProxy("",appObj);