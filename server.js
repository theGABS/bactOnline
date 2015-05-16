var WebSocketServer = new require('ws');

// подключенные клиенты
var clients = {};

var maxPlayerId = 0;
var players = {};

var maxBactId = 0;
var bacts = {};

var maxVirusId = 0;
var viruses = {};



for(var i = 0; i < 10; i++){
  bact = {};
  bact.id = i;
  bact.x = Math.round(Math.random()*4000);
  bact.y = Math.round(Math.random()*4000);
  bact.size = 40 + Math.round(Math.random()*40);
  bact.maxCount = bact.size/2;
  bact.count = Math.round(Math.random()*20);
  bact.color = 0; // нейтральный
  bact.team = 0; // нейтральная 
  bacts[maxBactId++] = bact;
}


setInterval(function() {
  for(var key in bacts){
    var bact = bacts[key];
    if(bact.team == 0) break;
    bact.count += 0.1 * Math.cos(Math.min(3.14, 3.14 / 2 * bact.count / bact.maxCount))
  }
  for(var key in viruses){
    var virus = viruses[key];
    var x = bacts[virus.target].x - virus.x;
    var y = bacts[virus.target].y - virus.y;
    var len = Math.sqrt(x*x+y*y);
    x /= len / Math.random() * 2;
    y /= len / Math.random() * 2;

    viruses[key].x += 10*x;
    viruses[key].y += 10*y;
    for(var key2 in bacts){
      var bact = bacts[key2];
      if( Math.pow(virus.x - bact.x , 2) + Math.pow(virus.y - bact.y , 2) < bact.size*bact.size){
        if(bact.id == virus.target){

          if(bact.team == virus.team){
            bact.count += 1;
          }else{
            bact.count -= 1;
          }
          if(bact.count < 1){
            bact.team = virus.team;
            bact.color = virus.color;
            players[virus.team].bactsId.push(bact.id);
          }

          
          delete viruses[key];
          break;
        }
      } 
    }
  }
}, 1000/60);


// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server( {port: 8081} );
webSocketServer.on('connection', function(ws) {

  var id = ++maxPlayerId;
  players[id] = {'id':id, 'team':id, 'bactsId':[], 'color' : Math.floor(1 + Math.random()*8)};
  var player = players[id];

  var needBact = 2;
  for(var key in bacts){
    if(bacts[key].team == 0){
      bacts[key].color = player.color;
      bacts[key].team = player.team;
      player.bactsId.push(bacts[key].id);
      if(--needBact == 0) break;
    }
  }
  while(needBact > 0){
    bact = {};
    bact.id = maxBactId;
    bact.x = Math.round(Math.random()*4000);
    bact.y = Math.round(Math.random()*4000);
    bact.size = 40 + Math.round(Math.random()*40);
    bact.maxCount = 64;
    bact.count = Math.round(Math.random()*20);
    bact.color = player.color; 
    bact.team = player.team;
    bacts[maxBactId++] = bact;
    player.bactsId.push(bact.id);
    needBact--;
  }

  for(var key in bacts){
    if(bacts[key].team == 0){
      bacts[key].color = player.color;
      bacts[key].team = player.team;
      player.bactsId.push(bacts[key].id);
      break;
    }
  }
  clients[id] = ws;
  console.log("новое соединение " + id);
  //ws.send(JSON.stringify( {"type":"startGame", "id" : id} ));
  ws.send(JSON.stringify( {"type":"player", "player" : player} ));

  ws.on('message', function(message) {
    //console.log('получено сообщение ' + message);
    var data = JSON.parse(message);
    if(data.type == 'getWorld'){
      ws.send(JSON.stringify( {"type":"getWorld", "bacts" : bacts, "viruses" : viruses, 'player':player} ));
    }

    if(data.type == 'myBact'){
      //bacts[data.myBact.id] = data.myBact;
    }

    if(data.type == 'attack'){
      console.log(data);
      for(var key in data.attack.who){
        var bact = bacts[data.attack.who[key]];
        if(player.bactsId.indexOf(bact.id) == -1){
          break;
        }
        console.log(bact);
        console.log(key);
        for(var i = 0; i < bact.count/2; i++){

          virus = {};
          //virus.id = i;
          virus.target = data.attack.target;
          virus.x = bact.x;
          virus.y = bact.y;
          virus.color = bact.color; // нейтральный
          virus.team = bact.team; // нейтральная 
          viruses[++maxVirusId] = virus;
        }
        bact.count *= 0.5;
      }
      //bacts[data.myBact.id] = data.myBact;
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
    //delete bacts[id];
  });

});