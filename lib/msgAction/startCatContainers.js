const path=require('path');
module.exports = function(message,container,plugin,remoteFn,loadPlugin){
	var plugin = {},
	    currentDir = path.join(__dirname,'..','..',"plugins"),
		catNames = Array.isArray(message.catNames) ? message.catNames : [message.catNames],
		allPluginsList = [];
		allPluginsList = fs.readdirSync(currentDir).forEach(x=>{
		    if(fs.existsSync(path.join(currentDir,x,"package.json"))  
				&& (x = require(path.join(currentDir,x,"package.json"))).categorie !== undefined
				&& catNames.indexOf(x.categorie) == -1
			){
				x.path = path.join(currentDir,x);
		    	loadPlugin(x);
			}
	    });
	this.sendMessage({
        fromUuid : obj.uuid,
        result : true,
        error :  null         
    });

}