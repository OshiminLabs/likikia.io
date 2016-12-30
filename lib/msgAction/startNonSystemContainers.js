const path=require('path');
module.exports = function(message,container,plugin,remoteFn,loadPlugin){
	var plugin = {},
	    currentDir = path.join(__dirname,'..','..',"plugins");
		
		fs.readdirSync(currentDir).map(x=>{
		    if(fs.existsSync(path.join(currentDir,x,"package.json"))  
				&& require(path.join(currentDir,x,"package.json")).categorie
				&& require(path.join(currentDir,x,"package.json")).localName)
			    	return x ;          
		}).filter(y=>y).forEach(j=>{
	    	plugin = require(currentDir,j,'package.json');
            plugin.path = path.join(currentDir,j,"package.json");
			loadPlugin(plugin);
		});

	this.sendMessage({
        fromUuid : obj.uuid,
        result : true,
        error :  null         
    });

}