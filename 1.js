document.addEventListener('DOMContentLoaded', function() {
    ready();
}, false);


var startGame = false;
var myID;
bacts = {};
bactColors = ['#FF0000' , '#00FF00', '#0000FF'];
var imageBact = new Image;
imageBact.src = 'bact.png';
var offsetX = 0;
var offsetY = 0;



function ready(){
	// создаем свою бактерию 
	// bacts[0] = {};
	// bacts[0].id = Math.round(Math.random()*100);
	// bacts[0].x = 100;
	// bacts[0].y = 100;
	// bacts[0].color = Math.round(Math.random() * 2 );

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
	  showMessage(event.data);
	  var data = JSON.parse(event.data);
	  if(data.type == 'getBact'){
	  	console.log(data);
	  	for(var key in  data.bacts){
	  		bacts[data.bacts[key].id] = data.bacts[key];
	  	}
	  }

		if(data.type == 'startGame'){
			myID = data.id;
			bacts[myID] = {};
			bacts[myID].id = myID;
			bacts[myID].x = 100;
			bacts[myID].y = 100;
			bacts[myID].color = Math.round(Math.random() * 2 );
			bacts[myID].size = 40;
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
		socket.send(JSON.stringify({"type":"myBact","myBact":bacts[myID]}));
	}

	setInterval(updateData, 16);
	//setInterval(sendData, 16);


	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");

	function render(){
		ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );

		for(var key in bacts){
			var bact = bacts[key];    
			ctx.beginPath();
			ctx.drawImage(imageBact, bact.x - bact.size, bact.y - bact.size , bact.size*2, bact.size*2);
			ctx.arc(bact.x, bact.y, bact.size - 5, 0, 2*Math.PI);
			ctx.fillStyle = bactColors[bact.color];
			ctx.fill();
			ctx.stroke();
		}
	}

	document.addEventListener("mousemove", mouseMove);
	function mouseMove(event){
		bacts[myID].x = event.clientX;
		bacts[myID].y = event.clientY;
		offsetX = bacts[myID].x;
		offsetY = bacts[myID].y;
		//ctx.translate(- offsetX + 200, - offsetY + 200);
		sendData();
	}
}