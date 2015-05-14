document.addEventListener('DOMContentLoaded', function() {
    ready();
}, false);


bacts = [];



function ready(){
	// создаем свою бактерию 
	bacts[0] = {};
	bacts[0].id = Math.round(Math.random()*100);
	bacts[0].x = 100;
	bacts[0].y = 100;

	// создать подключение
	var socket = new WebSocket("ws://localhost:8081");

	// отправить сообщение из формы publish
	document.forms.publish.onsubmit = function() {
	  var outgoingMessage = this.message.value;

	  socket.send(outgoingMessage);
	  return false;
	};

	// обработчик входящих сообщений
	socket.onmessage = function(event) {
	  var data = JSON.parse(event.data);
	  if(data.type == 'data'){
	  	for(var i = 0; i < data.bacts.size(); i++){
	  		for(var j = 0; j < bacts.size(); j++){
	  			if(data.bacts[i].id == bacts[j].id ){
	  				data.bacts[i] = bacts[j];
	  			}
	  		}
	  	}
	  }
	  var incomingMessage = event.data;
	  showMessage(incomingMessage);
	};

	// показать сообщение в div#subscribe
	function showMessage(message) {
	  var messageElem = document.createElement('div');
	  messageElem.appendChild(document.createTextNode(message));
	  document.getElementById('subscribe').appendChild(messageElem);
	}

	function updateData(){
		socket.send('getData');
	}

	function sendData(){
		socket.send();
	}

	setTimeout(updateData, 1000);


	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");

	ctx.fillStyle = "#FF0000";

	for(var i = 0; i < bacts.size; i++){
		ctx.beginPath();
		ctx.arc(bacts[i].x, bacts[i].y, 40, 0, 2*Math.PI);
		ctx.stroke();
	}
	

}