module.exports = function(message,container,plugin,remoteFn,loadPlugin){
	var plugin = {},
	    currentDir = path.join(__dirname,'..',"plugins");
		catNames = Array.isArray(message.catNames) ? message.catNames : [message.catNames],
		allPluginsList = [];
		allPluginsList = fs.readdirSync(currentDir).map(x=>{
			    if(fs.existsSync(path.join(currentDir,x,"package.json"))  
					&& require(path.join(currentDir,x,"package.json")).categorie !== undefined)
			    	return x ; 
		        else return false;          
		    }).filter(y=>y);

	for(var i in message.catNames){
		for (var j in allPluginsList){
				plugin = require(currentDir,j,'package.json');
				if(plugin.categorie == i)
					loadPlugin(plugin);
		}
	 
	}
	
	this.sendMessage({
        fromUuid : obj.uuid,
        result : true,
        error :  null         
    });

}