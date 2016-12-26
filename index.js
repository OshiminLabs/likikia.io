var fs = require("fs"),
    path = require("path"),
    phpjs = require("phpjs"),
    loadPlugin = require(path.join(__dirname,"lib","loadPlugin"));

const Logger = require('egg-logger').Logger;
const FileTransport = require('egg-logger').FileTransport;
const ConsoleTransport = require('egg-logger').ConsoleTransport;
global.CORE = {};
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

// load all system's plugins
fs.readdirSync( path.join(__dirname,"system")).map(x=>{
    if(fs.existsSync(path.join(__dirname,"system",x,"package.json"))){
        try{
            var plugin = require(path.join(__dirname,"system",x,"package.json"));
            plugin.path = path.join(__dirname,"system",x);
            if(plugin.localName)
                return plugin;
            }catch(e){}
    }
}).filter(x=>x).filter(x=>x.properties).forEach(loadPlugin);
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
}).filter(x=>x).filter(x=>x.prop.+6erties).forEach(loadPlugin);
setTimeout(function(){
    loadPlugin.startEvent();
},1000)

//console.log(JSON.stringify(CORE,null,4));