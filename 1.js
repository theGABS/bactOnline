document.addEventListener('DOMContentLoaded', function() {
    ready();
}, false);


bacts = {};
bactColors = ['#FF0000' , '#00FF00', '#0000FF'];



function ready(){
	// создаем свою бактерию 
	bacts[0] = {};
	bacts[0].id = Math.round(Math.random()*100);
	bacts[0].x = 100;
	bacts[0].y = 100;
	bacts[0].color = Math.round(Math.random() * 2.9 - 1);

	// создать подключение
	var socket = new WebSocket("ws://localhost:8081");

	// отправить сообщение из формы publish
	// document.forms.publish.onsubmit = function() {
	//   var outgoingMessage = this.message.value;

	//   socket.send(outgoingMessage);
	//   return false;
	// };

	// обработчик входящих сообщений
	socket.onmessage = function(event) {
	  var incomingMessage = event.data;
	  showMessage(incomingMessage);
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
	  
	};

	// показать сообщение в div#subscribe
	function showMessage(message) {
	  var messageElem = document.createElement('div');
	  messageElem.appendChild(document.createTextNode(message));
	  document.getElementById('subscribe').appendChild(messageElem);
	}

	function updateData(){
		socket.send(JSON.stringify({"type":"getBact"}));
		render();
		//socket.send('getData');
	}

	function sendData(){
		socket.send(JSON.stringify({"type":"myBact","myBact":bacts[0]}));
	}

	setInterval(updateData, 1000);
	setInterval(sendData, 1000);


	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");

	function render(){
		ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
		ctx.fillStyle = "#FF0000";

		for(var key in bacts){
			var bact = bacts[key];    
			ctx.beginPath();
			ctx.arc(bact.x, bact.y, 40, 0, 2*Math.PI);
			ctx.fillStyle = bactColors[bact.color];
			ctx.fill();
			ctx.stroke();
		}
	}

	document.addEventListener("mousemove", mouseMove);
	function mouseMove(event){
		bacts[0].x = event.clientX;
		bacts[0].y = event.clientY;
	}
}