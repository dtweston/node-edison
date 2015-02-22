function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var id = "64a57a29-9674-d633-d04c-b83c56ae6cb2";
if (process.argv.length>2)
{
  id = process.argv[2];
}

//var socket = require('socket.io-client')('http://localhost:4222');
var socket = require('socket.io-client')('http://edisonserver.azurewebsites.net');
  socket.on('connect', function(){
    console.log("connected");
    socket.emit('init',{clientType:'eddy',id: id});
  });
  socket.on('event', function(data){console.log("event " + data)});
  socket.on('disconnect', function(){
    console.log("disconnected");
  });
  socket.on('welcome', function(data){
    console.log("Welcome Message ");
    console.log(data);
  });