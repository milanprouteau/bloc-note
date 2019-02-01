var fs = require('fs');
const request = require('request');
var twilio = require('twilio');
const googleTTS = require("google-tts-api");
const { createAudio } = require('node-mp3-player');
const editJsonFile = require("edit-json-file");
const updateJsonFile = require('update-json-file');
const userHome = require('user-home');
const ipc = require('electron').ipcRenderer;

function noteCount(){ // Count the amount of note saved
	var read = fs.readFileSync('myjsonfile.json');
	var data = JSON.parse(read);
	var data2 = JSON.stringify(data);
	var cb = data2.match(/"id":/g);

	return cb.length;
}

	document.getElementById('ajoutez').addEventListener('click',function(){
		title = document.getElementById('title').value;
		message = document.getElementById('message').value;

		if (fs.existsSync('myjsonfile.json') == false) { // If json file doesn't exists
			var obj = {
   				note: [{'id': 0, 'title': title.toString(), 'message': message.toString()}]
			};
			var json = JSON.stringify(obj, null, 4);
			fs.writeFile('myjsonfile.json', json, 'utf8', function(err) {
    			if(err) return console.log(err);
				console.log("The file was saved for the first time!");
				toast(1);
				displayNote();
			});
		}else{
			fs.readFile('myjsonfile.json', 'utf8', function readFileCallback(err, data){
    			if (err){
        			console.log(err);
    			} else {
					var cb1 = data.match(/"id":/g); // count the amount of note
					cb1 = cb1.length;
					var obj = {
  						note: []
					};
					obj = JSON.parse(data);
					obj.note.push({id: cb1, title: title, message: message});
					obj = JSON.stringify(obj, null, 4);
    				fs.writeFile('myjsonfile.json', obj, 'utf8', function(err) {
    					if(err) return console.log(err);
						console.log("The file was saved in the file!");
						toast(1);
						displayNote();
						var client = new twilio('ACe1c50abb0d28db08f7b6dd98dc7bd4a2', '286416c143cec740a6daf985a83078c8');
						client.messages.create({
							to: '0658549675',
							from: '+33644602703',
							body: 'Nouvelle note ajouté !'
						  });
					});
				}
			});
		}
	});

	const electron = require('electron');

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("menu2");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];


// When the user clicks the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	console.log(event);
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Get the <span> element that closes the modal
var span2 = document.getElementsByClassName("close")[1];

	// When the user clicks on <span> (x), close the modal
		span2.onclick = function() {
		document.getElementById('myModalRemove').style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == document.getElementById('myModalRemove')) {
			document.getElementById('myModalRemove').style.display = "none";
		}
	}


document.getElementById('menu4').addEventListener('click', function () { // Quit the App
	ipc.send('quit');
});

function toast(i) { //Toggle Toast
	var x = document.getElementById("snackbar"+i);
	x.className = "show";
	setTimeout(function(){ x.className = x.className.replace("show", ""); }, 4000);
}


	fs.stat('myjsonfile.json', function(err, stats){// If json file do exist
	if(!err){
		displayNote();
	}else{
		alert('No file json');
	}
	});

	function getFilesizeInBytes(filename) {
        const stats = fs.statSync(filename);
        const fileSizeInBytes = stats.size;
        return fileSizeInBytes;
	}

function loop(){

	const stats = fs.statSync("myjsonfile.json");
	var fileSize = stats.size;
	window.setInterval(function(){ // Display the new note almost in real time.
		if(fileSize != getFilesizeInBytes('myjsonfile.json')){
			displayNote();
			fileSize = getFilesizeInBytes('myjsonfile.json');
		}
	},200, 1);
}

function displayNote(stop){
	if (stop) return; // stop the refreshing of the notes.
	var html = [];
	 fs.readFile("myjsonfile.json", 'utf8', function (err, data){
		if (err) displayNote(true); // Stop displaying if there is an error or if myjsonfile.json doesn't exist
		var data = JSON.parse(data);
		if(data.note.length == 0){
			fs.unlink('./myjsonfile.json', (err) => {
				if (err) throw err;
			});
		}
		var count = Object.keys(data.note).length-1;
		for(var i = 0; i <= count; i++){ // display note card
				html += '<div id="note'+i+'" draggable="true" ondrag="dragstart(event,'+data.note[i].id+');" class="card cardG"><h3 id="titleNote'+i+'">'+ eval('data.note['+ i +'].title')+'</h3><audio id="audio'+i+'" hidden><source src="mp3/tts'+i+'.mp3" type="audio/mp3"/></audio><img id="speak" onclick="speak(\''+data.note[i].title.replace("'","20htpm")+'\',\''+data.note[i].message.replace("'","20htpm")+'\', '+i+');" class="iconImg2" src="img/speaker.PNG" alt="Ecoutez"><img id="modif" onclick="modif('+ i +');" class="iconImg" src="img/pen.PNG" alt="Modifiez"><span id="deleteNote" name="'+i+'" onclick="deleteNote('+i+', false);"class="close cross">&times;</span><textarea id="area'+i+'" class="areaModif" name="'+i+'" style="display:none;">'+ eval('data.note['+ i +'].message')+'</textarea><p id="messageNote'+i+'">'+ eval('data.note['+ i +'].message')+'</p></div>'; 
		}
		document.getElementById('note').innerHTML = html;
	});
}

function characteresCount(max){
	var textArea = document.getElementById('message');
	var count = textArea.value.length;
	var circle2 = document.getElementById('circle2');

	circle2.style.strokeDashoffset = 50-(50*count/max);

	if (circle2.style.strokeDashoffset < 0) { // To stop filling the circle
		circle2.style.strokeDashoffset = 0;
	}

	if (circle2.style.strokeDashoffset < 51 && circle2.style.strokeDashoffset < 10) { // Blue color
		circle2.classList.remove('RadialCounter--warn', 'RadialCounter--danger');
		circle2.classList.add('RadialCounter--safe');
		document.getElementById('ajoutez').style.cursor = "pointer";
	}
	if (circle2.style.strokeDashoffset < 9 && circle2.style.strokeDashoffset > 0 ) { // Orange color
		circle2.classList.remove('RadialCounter--safe', 'RadialCounter--danger', 'RadialCounter--pulse');
		circle2.classList.add('RadialCounter--warn', 'RadialCounter--pulse');
		document.getElementById('ajoutez').style.cursor = "pointer";
	}
	if (circle2.style.strokeDashoffset == 0) { // Red color
		circle2.classList.remove('RadialCounter--safe', 'RadialCounter--warn', 'RadialCounter--pulse');
		circle2.classList.add('RadialCounter--danger', 'RadialCounter--pulse');
		document.getElementById('ajoutez').style.cursor = "not-allowed";
	}
	if (max-count < 0) { // display the extra characteres
		document.getElementById('over').style.display = "inline";
		document.getElementById('over').innerHTML = max-count;
	}else{
		document.getElementById('over').style.display = "none";
	}
}

function modif(i){ // Modify the note selected & save button appear

	var textArea = document.getElementById("area"+i);
	var noteArea = document.getElementById("messageNote"+i);
	var saveDiv = document.getElementById("save");
	var saveButton = document.getElementById('saveButton');
	var amountNote = noteCount();
	for (var a = 0; a < amountNote; a++) {
		if (document.getElementById("area"+a).style.display == "block" && a != i) { // If teaxtarea visible and user clicks on an other note
			toast(2);
			return false;
		}
	}

	if (textArea.style.display != "block") { // If TextArea not visible
		noteArea.style.display = "none";
		textArea.style.display = "block";
		save.style.display = "block";
		saveButton.setAttribute("name", ""+i+"");
	}else{
		noteArea.style.display = "block";
		textArea.style.display = "none";
		save.style.display = "none";
		saveButton.setAttribute("name", "");
	}
	return i;
} /* Fin modif() */

document.getElementById('saveButton').addEventListener("click", function(){ // If save button is clicked then edit note selected

	var id = document.getElementById("saveButton").name; // Note's Id
	var text = document.getElementById('area'+id).value;

	const filePath = './myjsonfile.json';

	updateJsonFile(filePath, (data) => {
		data.note[id].message = text; // change the message in the json file.
		return data;
	})
	modif(id);
	toast(3);
	displayNote();
	loop();
});

function deleteNote(id, bool){ // Delete the note[id]. If bool = true then the function will remove the note, otherwise nothing will happen
	const filePath = './myjsonfile.json';
	var button = document.getElementById('btnRemove');
	button.innerHTML= '<button id="non" class="nonRemove" onclick="deleteNote('+id+', false)">Non</button><button id="oui" class="ouiRemove" onclick="deleteNote('+id+', true)">Oui</button>';

	if(bool){
        var read = fs.readFileSync(filePath);
        var data = JSON.parse(read);
        delete data.note[id];
        var json = JSON.stringify(data, null, 4);
			fs.writeFile('myjsonfile.json', json.replace('\n\n        null,', '').replace(',\n        null', '').replace('\n        null,', '').replace('\n        null', ''), 'utf8', function(err) {
                if(err) return console.log(err);
            });
        displayNote();
	}

	// Get the modalRemove
	var modalRemove = document.getElementById('myModalRemove');

	if (modalRemove.style.display == "none") {
		// When the user clicks the button, open the modal
		modalRemove.style.display = "block";
	}else{
		modalRemove.style.display = "none";
    }
} /* Fin deleteNote() */

function dragstart(event, id){
	fs.readFile("myjsonfile.json", 'utf8', function (err, data) {
		if (err) return cosole.log(err);
		var data = JSON.parse(data);
		var count = Object.keys(data.note).length-1;
		for(var i = 0; i <= count; i++){
			if(data.note[i].id == id){
				title = data.note[i].title;
				message = data.note[i].message;
			}
		}
	});
	if (event.screenX == 0 && event.screenY == 0) { // if the user is leave the window
		if (fs.existsSync(userHome+'/Desktop/note'+id+'.txt') == false) { // Check if the file is not already saved on desktop, if not then save it
			fs.appendFile(userHome+'/Desktop/note'+id+'.txt', title+'\r\n\r\n'+message, function (err) {
				if (err) throw err;
				console.log('Saved!');
				return true;
			});
		}else{
			ipc.send('information-dialog-selection');
		}
	} 
}

function speak(title, message, id) {
	console.log("Player running")
	googleTTS(title, 'fr', 1)   // speed normal = 1 (default), slow = 0.24
	.then(function (url) {
	console.log(url); // https://translate.google.com/translate_tts?...
	const options = {
		url: `https://translate.google.com/translate_tts?ie=UTF-8&q=`+encodeURIComponent(title.replace("20htpm","'"))+`%20.`+encodeURIComponent(message).replace("20htpm", "'")+`&tl=fr&client=tw-ob`,
		headers: {
			'Referer': 'http://translate.google.com/',
			'User-Agent': 'stagefright/1.2 (Linux;Android 5.0)'
		}
	}
	
	request(options).pipe(fs.createWriteStream('mp3/tts'+id+'.mp3'));

	
		var audio = document.getElementById('audio'+id+''); 	
		var read = fs.readFileSync(__dirname+'/mp3/tts'+id+'.mp3');
		audio.play();
	
	
	
	})
	.catch(function (err) {
	console.error(err.stack);
	});
	
	
}