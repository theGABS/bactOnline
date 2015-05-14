var WebSocketServer = new require('ws');

// подключенные клиенты
var clients = {};

bacts = {};

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({
  port: 8081
});
webSocketServer.on('connection', function(ws) {

  var id = Math.round(Math.random()*1000);
  clients[id] = ws;
  console.log("новое соединение " + id);

  ws.on('message', function(message) {
    console.log('получено сообщение ' + message);
    var data = JSON.parse(message);
    if(data.type == 'getBact'){
      ws.send(JSON.stringify(bacts));
    }

    if(data.type == 'myBact'){
      bacts[data.myBact.id] = data.myBact;
    }




    // for (var key in clients) {
    //   var data = {};
    //   data.type = 'd';
    //   clients[key].send(JSON.stringify(data));
      
    // }
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});