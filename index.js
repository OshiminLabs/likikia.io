var fs = require("fs"),
    path = require("path"),
    phpjs = require("phpjs"),
    loadPlugin = require(path.join(__dirname,"lib","loadPlugin"));

const Logger = require('egg-logger').Logger;
const FileTransport = require('egg-logger').FileTransport;
const ConsoleTransport = require('egg-logger').ConsoleTransport;
global.CORE = {};

//CORE.REPL.version().then(function(value){
//
//})
//CORE.REPL.version("to",123).then(function(value){
//
//})
global.logger = new Logger();

/*
logger.set('file', new FileTransport({
  file: '/tmp/likikia.log',
  level: 'DEBUG',
}));
*/
logger.set('console', new ConsoleTransport({
  level: 'DEBUG',
}));

/*["debug","log","info","warn","error"].forEach(x=>console[x] = function(){
    var a = Array.prototype.slice.call(arguments);
    a.unshift(`[${phpjs.date("d/m/Y H:i:s")}]`);
    logger[x =="log" ? "debug" : x ].apply(logger,a);
});*/
// load all plugins
fs.readdirSync( path.join(__dirname,"plugins")).map(x=>{
    if(fs.existsSync(path.join(__dirname,"plugins",x,"package.json"))){
        try{
            var plugin = require(path.join(__dirname,"plugins",x,"package.json"));
            plugin.path = path.join(__dirname,"plugins",x);
            if(plugin.localName)
                return plugin;
            }catch(e){}
    }
}).filter(x=>x).filter(x=>x.properties).forEach(loadPlugin);
loadPlugin.startEvent();

console.log(JSON.stringify(CORE,null,4));