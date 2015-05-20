document.addEventListener('DOMContentLoaded', function() {
    ready();
}, false);

player = {'id':null , 'bactsId':[]};

var startGame = false;
var myID;
bacts = {};
viruses = {};
bactColors = ['#777' , '#FF0000' , '#00FF00', '#0000FF' ,  '#FFFF00' , '#00FFFF', '#FF00FF' ,  '#FF8888' , '#88FF88', '#8888FF'];
imageBact = new Image;
imageBact.src = 'bact.png';
var offsetX = 0;
var offsetY = 0;
var scaleX = 1;
var scaleY = 1;

var mouseX, mouseY;
var mouseWorldX, mouseWorldY;

var haveSelect = false;

var needMoveX = 0;
var needMoveY = 0;

var canDrag = false;



function ready(){
	// создаем свою бактерию 
	// bacts[0] = {};
	// bacts[0].id = Math.round(Math.random()*100);
	// bacts[0].x = 100;
	// bacts[0].y = 100;
	// bacts[0].color = Math.round(Math.random() * 2 );

	// создать подключение
	//var socket = new WebSocket("ws://localhost:8081");
	var socket = new WebSocket("ws://localhost:8080");
	socket.nowOpen = false;
	

	// отправить сообщение из формы publish
	// document.forms.publish.onsubmit = function() {
	//   var outgoingMessage = this.message.value;

	//   socket.send(outgoingMessage);
	//   return false;
	// };

	socket.onopen = function(event){
		socket.nowOpen = true;
		setInterval(updateData, 16);
	}

	// обработчик входящих сообщений
	socket.onmessage = function(event) {
	  showMessage(event.data);
	  var data = JSON.parse(event.data);
	  globalData = data; // TODO 

	  if(data.type == 'getWorld'){
	  	//console.log(data);
	  	player = data.player;
	  	viruses = data.viruses;
	  	tmpBacts = bacts;
	  	bacts = data.bacts;
	  	for(var key in  bacts){
	  		if(tmpBacts[key]){
	  			bacts[key].select = tmpBacts[key].select;
	  		}else{
  				bacts[key].select = false;
	  		}
	  		
	  	}
	  }

	  if(data.type == 'player'){
	  	player = data.player;
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
	  document.getElementById('info').appendChild(messageElem);
	}

	function updateData(){
		socket.send(JSON.stringify({"type":"getWorld"}));
		render();
		//socket.send('getData');
	}

	function sendData(){
		socket.send(JSON.stringify({"type":"myBact","myBact":bacts[myID]}));
	}

	


	var c = document.getElementById("canvas");
	c.width  = window.innerWidth;
	c.height = window.innerHeight;
	var ctx = c.getContext("2d");

	function render(){
		ctx.beginPath();
		ctx.setTransform(1,0, 0, 1, 0, 0);
		ctx.fillStyle = "rgba(110, 110, 110, 255)";
		ctx.fillRect( 0 , 0 , c.width, c.height );
		ctx.setTransform(scaleX,0, 0, scaleY, -offsetX, -offsetY);


		
		
		var bw = 4000;
		var bh = 4000;
		var p = 100;
		for (var x = 0; x <= bw; x += 400) {
		    ctx.moveTo(0.5 + x + p, p);
		    ctx.lineTo(0.5 + x + p, bh + p);
		}


		for (var x = 0; x <= bh; x += 400) {
		    ctx.moveTo(p, 0.5 + x + p);
		    ctx.lineTo(bw + p, 0.5 + x + p);
		}

		ctx.strokeStyle = "black";
		ctx.stroke();

		for(var key in bacts){
			var bact = bacts[key];    
			ctx.beginPath();
			
			ctx.fillStyle = bactColors[bact.color];
			ctx.strokeStyle =  bactColors[bact.color];
			ctx.arc(bact.x, bact.y, bact.size - 5, 0, 2*Math.PI);
			ctx.stroke();
			ctx.fill();
			ctx.beginPath();
			
			
			if(player.bactsId.indexOf(bact.id) != -1){
				ctx.lineWidth = 7;
				var speed = 5*Math.sin(new Date().getTime() * 0.005);
				if(bact.select){
					speed = 10*Math.sin(new Date().getTime() * 0.015);
				}
				ctx.arc(bact.x, bact.y, bact.size + 15 + speed, 0, 2*Math.PI);

				ctx.stroke();
				ctx.lineWidth = 1;
				
				
			}
			if(bact.select){ctx.globalAlpha = 0.8;}else{ctx.globalAlpha = 0.5;}
			
			
			ctx.drawImage(imageBact, bact.x - bact.size, bact.y - bact.size , bact.size*2, bact.size*2);
			ctx.globalAlpha = 1;
			

			ctx.strokeText(bact.id + " " + Math.floor(bact.count), bact.x, bact.y);
		}

		for(var key in viruses){
			var virus = viruses[key];
			ctx.beginPath();
			ctx.fillStyle = bactColors[virus.color];
			ctx.arc(virus.x, virus.y, 10, 0, 2*Math.PI);
			ctx.fill();
			ctx.stroke();

			//ctx.strokeText(bact.id,bact.x, bact.y);
		}

		// bacts[myID].x = mouseX / scaleX + offsetX;
		// bacts[myID].y = mouseY / scaleY + offsetY;
		//offsetX = bacts[myID].x;
		//offsetY = bacts[myID].y;
		sendData();

		// if(mouseX < 100){
		// 	offsetX -= 10;
		// }

		// if(mouseY < 100){
		// 	offsetY -= 10;
		// }

		// if(mouseX > window.innerWidth - 100){
		// 	offsetX += 10;
		// }

		// if(mouseY > window.innerHeight - 100){
		// 	offsetY += 10;
		// }

		offsetX += needMoveX * 0.2;
		offsetY += needMoveY * 0.2;
		needMoveX *= 0.8;
		needMoveY *= 0.8;

		ctx.setTransform(scaleX,0, 0, scaleY, -offsetX, -offsetY);


		ctx.drawImage(imageBact, mouseWorldX, mouseWorldY, 10, 10);
	}

	document.addEventListener("mousemove", mouseMove);
	function mouseMove(event){
		mouseX = event.clientX;
		mouseY = event.clientY;
		mouseWorldX = (mouseX + offsetX) / scaleX;
		mouseWorldY = (mouseY + offsetY) / scaleY;

		//bacts[myID].x = event.clientX / scaleX + offsetX;
		//bacts[myID].y = event.clientY / scaleY + offsetY;
		//offsetX = bacts[myID].x;
		//offsetY = bacts[myID].y;
		//ctx.translate(- offsetX + 200, - offsetY + 200);
		//sendData();

		// if(event.clientX < 100){
		// 	offsetX--;
		// }

		if(canDrag){
			// if( Math.pow(mouseX - mouseClickX, 2) + Math.pow(mousY - mouseClickY, 2) < 10*10){
			// 	offsetX 
			// }

			needMoveX += mouseClickX - mouseX;
			needMoveY += mouseClickY - mouseY;

			mouseClickX = mouseX;
			mouseClickY = mouseY; 
		}


	}

	function attack(target){
		console.log("attack" + target);
		var who = [];
		for(var key in bacts){
			if(bacts[key].select){
				who.push(key);
			}
		}  
		console.log(who);
		socket.send(JSON.stringify({"type":"attack","attack":{'who':who, 'target': target}}));
	}

	document.addEventListener("mousedown", mouseDown);
	function mouseDown(event){
		mouseClickX = event.clientX;
		mouseClickY = event.clientY;
		canDrag = true;
	}

	document.addEventListener("mouseup", mouseUp);
	function mouseUp(event){
		//mouseClickX = event.clientX;
		//mouseClickY = event.clientY;
		canDrag = false;
	}

	document.addEventListener("click" , mouseClick);
	function mouseClick(){
		
		console.log("click");
		var selectBact = false;
		for(var key in bacts){
			if( Math.pow(bacts[key].x - mouseWorldX , 2) + 
				Math.pow(bacts[key].y - mouseWorldY , 2) < bacts[key].size * bacts[key].size){

				if(player.bactsId.indexOf(bacts[key].id) == -1){
					if(haveSelect){
						attack(key);
						break;
					}
				}else{
					bacts[key].select = true;
					haveSelect = true;
					selectBact = true;
				}
				
			}  
		}
		if(!selectBact){
			for(var key in bacts){
				bacts[key].select = false;
			}  
			haveSelect = false;
		}
	}

	document.addEventListener("wheel", onWheel);
	function onWheel(event){
		var delta = event.deltaY || event.detail || event.wheelDelta;
		console.log(delta);
		tmpScale = scaleX;
		scaleY = scaleX = scaleX * (1 - delta*0.005);
		offsetX -= mouseWorldX*(tmpScale - scaleX);
		offsetY -= mouseWorldY*(tmpScale - scaleY);
		//offsetY = (mouseY  * tmpScale + tmpScale * offsetY - mouseY*scaleX)/scaleY;
		//offsetY = (mouseY  * tmpScale * delta*0.0005 + tmpScale * offsetY)/scaleY;
		//offsetY = (mouseY * tmpScale * delta*0.0005 + tmpScale * offsetY)/scaleY;
		ctx.setTransform(scaleX,0, 0, scaleY, -offsetX, -offsetY);
		event.preventDefault ? event.preventDefault() : (event.returnValue = false);
	}

	window.addEventListener("resize", resize);
	function resize(){
		console.log("resize now");
		//c - canvas
		c.width  = window.innerWidth;
		c.height = window.innerHeight;
	}
}