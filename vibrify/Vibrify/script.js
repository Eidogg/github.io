//#region Firebase
var firebaseConfig = {
	apiKey: "AIzaSyChoPox89Dq8k-Z3mxWWlS_Ix_wtuRs2Bw",
	authDomain: "vibrify.firebaseapp.com",
	projectId: "vibrify",
	storageBucket: "vibrify.appspot.com",
	messagingSenderId: "173332447558",
	appId: "1:173332447558:web:ba430d79bef0f3dcafe547",
	measurementId: "G-JBNDCH2348"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const database = firebase.firestore();
const auth = firebase.auth();
//#endregion

//#region Variables
var feedbackHTML = document.getElementById("feedback");
var authenticationHTML = document.getElementById("screen-authentication");
var mvpHTML = document.getElementById("screen-chat");
var addBHTML = document.getElementById("addB");
var addHTML = document.getElementById("listinp");
var listinput = document.getElementById("list-input");
var listDiv = document.getElementById("lists-div");
var listDiv2 = document.getElementById("lists-div-2");
var lists = document.getElementById("lists");
var songContainer = document.getElementById("songcontainer");
var curUser;

var addHTML2 = document.getElementById("songinp");
var addB2HTML = document.getElementById("addB2");

let currentListID;
//#endregion

//#region Front end
function showAddScreen() {
  addHTML.style.display = "flex";
  addBHTML.style.display = "none";
}

function randomID(){
	return '_' + Math.random().toString(36).substr(2, 9);
}

function showMvpScreen() {
	authenticationHTML.style.display = "none";
	mvpHTML.style.display = "flex";
}

function addList(listId, listName, songCount){
	let template = `							
	<div class="listcontainer" onclick="getList('${listId}')">
		<div id="${listId}" class="list-div">
			<h2>${songCount} <br> Songs</h2>
			<h1>${listName} <br>
				<p>Songs</p>
			</h1>
		</div>
	</div>
	`
	lists.innerHTML += template;
}

function showSongAddScreen() {
  addHTML2.style.display = "flex";
  addB2HTML.style.display = "none";
}

function addSong() {
  addHTML2.style.display = "none";
  addB2HTML.style.display = "block";
}

function addBtn() {
	let curID = randomID();
  addHTML.style.display = "none";
  addBHTML.style.display = "block";
	let listInput = document.getElementById('list-input').value;

	database.collection('users').doc(curUser).collection('lists').doc(curID).set({
		name: listInput,
		id: curID,
		songs: []
	})
	
	syncDatabase();
}

function openList(){
	listDiv2.style.display = "block";
	listDiv.style.display = "none";
}

function addSongToList(){
	let name = document.getElementById('name-input').value;
	let artist = document.getElementById('artist-input').value;
	let instrument = document.getElementById('instrument').value;
	let genre = document.getElementById('genre-input').value;
	let tempo = document.getElementById('tempo-input').value;

	database.collection('users').doc(curUser).collection('lists').doc(currentListID).get().then((songs) => {
		let songArray = songs.data().songs;
		songArray.push({
			name: name,
			artist: artist,
			instrument: instrument,
			genre: genre,
			tempo: tempo
		});
		database.collection('users').doc(curUser).collection('lists').doc(currentListID).update({
			"songs" : songArray
		});
	}).then(() => {
		songContainer.innerHTML = '';
		getList(currentListID);
	});
}

function renderSongList(song){
	let instrument;
	switch(song.instrument){
		case 'guitar':
			instrument = 'images/guitar.png';
			break;
		case 'guitarE':
			instrument = 'images/guitarE.png';
			break;
		case 'piano':
			instrument = 'images/piano.png';
			break;
		case 'bass':
			instrument = 'images/bass.png';
			break;
		case 'violin':
			instrument = 'images/violin.png';
			break;
		case 'sax':
			instrument = 'images/sax.png';
			break;
		case 'drums':
			instrument = 'images/drums.png';
			break;
		case 'voice':
			instrument = 'images/voice.png';
			break;
		case 'flute':
			instrument = 'images/flute.png';
			break;
		case 'other':
			instrument = 'images/other.png';
			break;
		default:
			instrument = 'images/other.png';
			break;
	}
	songContainer.innerHTML += `
	<div>
		<img src="${instrument}" alt="instrument">
		<h1>${song.name}<br>
			<p>${song.artist}</p>
		</h1>
	</div>
	`;
}

function closeList(){
	songContainer.innerHTML = '';
	listDiv2.style.display = "none";
	listDiv.style.display = "block";
	syncDatabase();

}
//#endregion

//#region Backend
auth.onAuthStateChanged(function (user) {
	if (user) {
		curUser = user.uid;
		showMvpScreen();
		syncDatabase();
	} else {
		console.log("user is not signed in");
	}
});

// Log out
function logout() {
	auth.signOut().then(() => {
		document.getElementById("email").value = "";
		document.getElementById("password").value = "";
		authenticationHTML.style.display = "flex";
		mvpHTML.style.display = "none";
	})
	.catch(function (error) {
		feedbackHTML.innerHTML = error.message;
	});
}

// Sign up
function signup() {
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;

	auth.createUserWithEmailAndPassword(email, password)
	.then((cred) => {
		let curID = randomID();
		database.collection('users').doc(cred.user.uid).set({
			email: email
		});
		database.collection('users').doc(cred.user.uid).collection('lists').doc(curID).set({
			name: 'Sample Playlist',
			id: curID,
			songs: []
		});
	}).then(() => {
		feedbackHTML.innerHTML = "Successfully signed up!";
	})
	.catch((error) => {
		feedbackHTML.innerHTML = error.message;
	});
}

// Login
function login() {
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;

	auth.signInWithEmailAndPassword(email, password)
		.then(() => {
			feedbackHTML.innerHTML = "Login successfull!"
		})
		.catch((error) => {
			feedbackHTML.innerHTML = error.message;
		});
}

function syncDatabase(){
	lists.innerHTML = "";
	database.collection('users').doc(curUser).collection('lists').get().then(docs => {
		docs.forEach(doc => {
			addList(doc.data().id, doc.data().name, doc.data().songs.length)
		});
	});
}

function getList(id){
	database.collection('users').doc(curUser).collection('lists').doc(id).get().then(doc => {
		openList();
		doc.data().songs.forEach(song => {
			renderSongList(song);
		});
	});
	currentListID = id;
}
//#endregion