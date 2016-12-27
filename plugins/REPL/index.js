var msg = 'message';

const readline = require('readline');
const net = require('net');
var server = net.createServer((socket)=> {
  socket.write('Echo server\r\n');
  var rl = readline.createInterface({
      prompt: 'socket '+socket.remoteAddress+':'+socket.remotePort+'> '
    , input: socket
    , output: socket
    , terminal: true
    , useGlobal: false
  });
  rl.setPrompt('OHAI> ');
  rl.prompt();

  rl.on('line', function(line) {
    switch(line.trim()) {
      case 'hello':
        socket.write('world!\n');
        break;
      default:
        socket.write('Say what? I might have heard `' + line.trim() + '`\n');
        break;
    }
    rl.prompt();
  }).on('close', function() {
    console.log('Have a great day!');
  });
});

app.on("stop",()=>{
    server.close(function(){
        console.log("REPL server close");        
    });
    console.log("REPL bye bye");
});
app.on("start",async function(){
    server.listen(1337);
});