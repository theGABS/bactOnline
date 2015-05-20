var WebSocketServer = new require('ws');

// подключенные клиенты
var clients = {};

var maxPlayerId = 0;
var players = {};

var maxBactId = 0;
var bacts = {};

var maxVirusId = 0;
var viruses = {};

var colorSize = 9;



players[0] = {'id':0, 'team':0, 'bactsId':[], 'color' : 0 , 'bot':false}; // нейтральный игрок
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
  bact.bot = false; //нейтральная не является ботом
  bacts[maxBactId++] = bact;
  players[0].bactsId.push(bact.id);
}



function attack(bact,target){
      console.log(bact);
      for(var i = 0; i < bact.count/2; i++){
          virus = {};
          virus.target = target;
          virus.x = bact.x;
          virus.y = bact.y;
          virus.color = bact.color;
          virus.team = bact.team; 
          viruses[++maxVirusId] = virus;
        }
        bact.count *= 0.5;
    }


setInterval(function() {
  for(var key in bacts){
    var bact = bacts[key];
    if(bact.team == 0) continue;
    if(bact.bot){
      if(Math.random() < 0.01){
        attack(bact, Math.floor(maxBactId * Math.random()));
      }
    }
    
    bact.count += 0.1 * Math.cos(Math.min(3.14, 3.14 / 2 * bact.count / bact.maxCount))

    
  }
  for(var key in viruses){
    var virus = viruses[key];
    var x = bacts[virus.target].x - virus.x;
    var y = bacts[virus.target].y - virus.y;
    var len = Math.sqrt(x*x+y*y);
    x /= len;
    y /= len;

    viruses[key].x += 10*x + (0.5-Math.random()) * 4;
    viruses[key].y += 10*y + (0.5-Math.random()) * 4;
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
            players[bact.team].bactsId.splice(players[bact.team].bactsId.indexOf(bact.id), 1);
            bact.team = virus.team;
            bact.color = virus.color;
            bact.bot = players[virus.team].bot; 
            players[virus.team].bactsId.push(bact.id);
          }

          
          delete viruses[key];
          break;
        }
      } 
    }
  }
}, 1000/60);

function newPlayer(){
  var id = ++maxPlayerId;
  players[id] = {'id':id, 'team':id, 'bactsId':[], 'color' : 1 + id % colorSize, 'bot':true};
  var player = players[id];

  var needBact = 2;
  while(needBact > 0){
    bact = {};
    bact.id = maxBactId;
    bact.x = Math.round(Math.random()*4000);
    bact.y = Math.round(Math.random()*4000);
    bact.size = 40 + Math.round(Math.random()*40);
    bact.maxCount = 64;
    bact.count = 0;
    bact.color = player.color; 
    bact.team = player.team;
    bact.bot = true;
    bacts[maxBactId++] = bact;

    player.bactsId.push(bact.id);
    needBact--;
  }
}

newPlayer(); // bot 1;
newPlayer(); // bot 2;

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server( {port: 8080} );
webSocketServer.on('connection', function(ws) {

  var id = ++maxPlayerId;
  players[id] = {'id':id, 'team':id, 'bactsId':[], 'color' : 1 + id % colorSize, 'bot':false};
  var player = players[id];

  var needBact = 2;

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
        attack(bact, data.attack.target);
        
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