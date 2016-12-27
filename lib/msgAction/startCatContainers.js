const pluginLoader = require(path.join(__dirname,"lib","loadPlugin"));

module.exports = function(message,container,plugin,remoteFn,loadPlugin){
	var catNames = Array.isArray(message.catNames) ? message.catNames : [message.catNames],
		allPluginsList = 

	fs.readdirSync( path.join(__dirname,"plugins")).map(x=>{
	    if(fs.existsSync(path.join(__dirname,"plugins",x,"package.json"))){
	        try{
	            var plugin = require(path.join(__dirname,"plugins",x,"package.json"));
	            plugin.path = path.join(__dirname,"plugins",x);
	            if(plugin.localName)
	                return plugin;
	            }catch(e){}
    }

    
	for(var i in message.catNames){
		var plugin = require(__dirname,'..','plugins',i,'package.json');
		if(plugin.categorie == i)
		loadPlugin(plugin);
		 
	}
}