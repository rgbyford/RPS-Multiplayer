//const admin = require("firebase-admin");
//const functions = require('firebase-functions');
//var firebase = require("firebase");

//import * as functions from "firebase-functions";
//import * as admin from "firebase-admin";
//<script src="https://www.gstatic.com/firebasejs/5.5.1/firebase.js"></script>
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCsDh3ra7faSCJycuwelMipu-6biTdqFMM",
    authDomain: "rgb-rps.firebaseapp.com",
    databaseURL: "https://rgb-rps.firebaseio.com",
    projectId: "rgb-rps",
    storageBucket: "rgb-rps.appspot.com",
    messagingSenderId: "277284413470"
};
firebase.initializeApp(config);
var firestore = firebase.firestore();
//var db = admin.firestore();

//admin.initializeApp(functions.config().firebase);

const docRef = firestore.collection('players').doc('b');
// or firestore.doc ("players/Pat");
const collRef = firestore.collection('players');
const h1 = document.querySelector("#h1");
const newPlayer = document.querySelector("#newPlayer");
const addButton = document.querySelector("#addButton");

var playerToAdd;

addButton.addEventListener("click", function () {
    playerToAdd = newPlayer.value;
    console.log("Adding player ", playerToAdd);
    // document with the same name as First_name within the doc!
    collRef.doc(playerToAdd).set({
        First_name: playerToAdd
    }).then(function () {
        console.log("Player added");
    }).catch(function (error) {
        console.log("Error adding player");
    });
})

loadButton.addEventListener("click", function () {
    collRef.get().then(snapshot => {
        snapshot.forEach(doc => {
            console.log(doc.id, doc.data(), "FN: ", doc.data().First_name);
        });
    }).catch(function (error) {
        console.log("Error on loadButton");
    });
    docRef.get().then(doc => {
        console.log("Finally: ", doc.data().First_name);
    })
})

var observer = collRef.onSnapshot(docSnapshot => {
  console.log(`Received doc snapshot: ${docSnapshot}`);
  // ...
}, err => {
  console.log(`Encountered error: ${err}`);
});


// Get a database reference to database
//var db = admin.database();
//var ref = db.ref("https://rgb-rps.firebaseio.com");

/*
var docRef = db.collection('players').doc('Roger');

var setRoger = docRef.set({
    first: 'Roger',
    last: 'Byford',
    born: 1953
});

db.collection('players').get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data());
        });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
*/

/*
admin.database().ref('/messages').push({
    text: "testing the database",
    author: {
        uid: "rgb",
        name: "Roger",
        email: "rgb@xmail.com"
    },
}).then(() => {
    console.log('New Message written');
    return (
        "test done"
    );
})
*/

/*
var express = require('express');
var app = express();
var gameRef;

go();

function go() {
    var userId;

    app.get('/user/:id', function (request, response) {
        response.send('user ' + request.params.id);
        userId = response.params.id;
    });

    //        var userId = ('Username?', 'Guest');
    // Consider adding '/<unique id>' if you have multiple games.
    var gameRef = new Firebase(GAME_LOCATION);
    gameRef = GAME_LOCATION;
    assignPlayerNumberAndPlayGame(userId, gameRef);
};

// The maximum number of players.  If there are already 
// NUM_PLAYERS assigned, users won't be able to join the game.
var NUM_PLAYERS = 2;

// The root of your game data.
var GAME_LOCATION = 'https://rgb-rps.firebaseio.com/';

// A location under GAME_LOCATION that will store the list of 
// players who have joined the game (up to MAX_PLAYERS).
var PLAYERS_LOCATION = 'player_list';

// A location under GAME_LOCATION that you will use to store data 
// for each player (their game state, etc.)
var PLAYER_DATA_LOCATION = 'player_data';


// Called after player assignment completes.
function playGame(myPlayerNumber, userId, justJoinedGame, gameRef) {
    var playerDataRef = gameRef.child(PLAYER_DATA_LOCATION).child(myPlayerNumber);
    alert('You are player number ' + myPlayerNumber +
        '.  Your data will be located at ' + playerDataRef.toString());

    if (justJoinedGame) {
        alert('Doing first-time initialization of data.');
        playerDataRef.set({
            userId: userId,
            state: 'game state'
        });
    }
}

// Use transaction() to assign a player number, then call playGame().
function assignPlayerNumberAndPlayGame(userId, gameRef) {
    var playerListRef = gameRef.child(PLAYERS_LOCATION);
    var myPlayerNumber, alreadyInGame = false;

    playerListRef.transaction(function (playerList) {
        // Attempt to (re)join the given game. Notes:
        //
        // 1. Upon very first call, playerList will likely appear null (even if the
        // list isn't empty), since Firebase runs the update function optimistically
        // before it receives any data.
        // 2. The list is assumed not to have any gaps (once a player joins, they 
        // don't leave).
        // 3. Our update function sets some external variables but doesn't act on
        // them until the completion callback, since the update function may be
        // called multiple times with different data.
        if (playerList === null) {
            playerList = [];
        }

        for (var i = 0; i < playerList.length; i++) {
            if (playerList[i] === userId) {
                // Already seated so abort transaction to not unnecessarily update playerList.
                alreadyInGame = true;
                myPlayerNumber = i; // Tell completion callback which seat we have.
                return;
            }
        }

        if (i < NUM_PLAYERS) {
            // Empty seat is available so grab it and attempt to commit modified playerList.
            playerList[i] = userId; // Reserve our seat.
            myPlayerNumber = i; // Tell completion callback which seat we reserved.
            return playerList;
        }

        // Abort transaction and tell completion callback we failed to join.
        myPlayerNumber = null;
    }, function (error, committed) {
        // Transaction has completed.  Check if it succeeded or we were already in
        // the game and so it was aborted.
        if (committed || alreadyInGame) {
            playGame(myPlayerNumber, userId, !alreadyInGame, gameRef);
        } else {
            alert('Game is full.  Can\'t join. :-(');
        }
    });
}
exports.playerCreated = functions.firestore
.document('players/{playerId}')
.onCreate(event => {
    console.log("Player created");
    // trigger content...
});

*/
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
/*
console.log("test");
exports.helloWorld = functions.https.onRequest((request, response) => {
    console.log('test');
    response.send("Hello from Firebase to you!");
});
*/