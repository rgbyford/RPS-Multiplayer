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

//const docRef = firestore.collection('players').doc('b');
// or firestore.doc ("players/Pat");
const collRef = firestore.collection('players');
const h1 = document.querySelector("#h1");
const newPlayer = document.querySelector("#newPlayer");
const playButton = document.querySelector("#playBtn");

var sSelf;
var bReadyToPlay;
var bPlayed;

// "play" button
playButton.addEventListener("click", function () {
    var bFoundUser = false;
    var playerToAdd;

    event.preventDefault();
    playerToAdd = newPlayer.value.trim();
    console.log("Adding player ", playerToAdd);
    //    const playerRef = firestore.collection('players').doc('q');
    const playerRef = firestore.collection('players').doc(playerToAdd);
    playerRef.get()
        .then(doc => {
            if (doc.exists) {
                console.log("Existing player");
            } else {
                console.log("New player");
                collRef.doc(playerToAdd).set({
                    First_name: playerToAdd
                }).then(function () {
                    console.log("Player added");
                }).catch(function (error) {
                    console.log("Error adding player");
                });
            }
            collRef.doc(playerToAdd).set({
                bReadyToPlay: true
            }).then(function () {
                console.log("Ready to play set");
            }).catch(function (error) {
                console.log("Error setting ready to play");
            });
            console.log("All set!");
            sSelf = playerToAdd;
            ReadyToPlay("");
        });
})

/*
loadButton.addEventListener("click", function () {
    event.preventDefault();
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
*/
var observer = collRef.onSnapshot(docSnapshot => {
    console.log(`Received doc snapshot: ${docSnapshot}`);
    // ...
}, err => {
    console.log(`Encountered error: ${err}`);
});

function ReadyToPlay(sOtherPlayer) {
    bReadyToPlay = true;
    collRef.doc(sSelf).set({
        bReadyToPlay: true
    }).then(doc => {
        console.log("Ready to play set");
        if (sOtherPlayer == "") {
            //            var queryRef = citiesRef.where('state', '==', 'CA');
            //            const docRef = firestore.collection('players').doc('Roger');

            playerRef = collRef.where('bReadyToPlay', '==', true);
            //playerRef = firestore.collection('players').where('First_name', '==', 'Roger');
            //            const playerRef = firestore.collection('players').doc(bReadyToPlay == true);
            playerRef.get().then(snapshot => {
                snapshot.forEach(doc => {
                    if (sOtherPlayer == "") {
                        sOtherPlayer = doc.data().First_name;
                        console.log(`You are playing against ${sOtherPlayer}`);
                        RPSButtons(sOtherPlayer);
                        // put RPS buttons up and then wait for click
                    }
                });
            });
        } else {
            console.log(`Playing against existing player ${playerToAdd}`);
            RPSButtons(sOtherPlayer);
            // put RPS buttons up and wait for click
        }
    }).catch(function (error) {
        console.log("Error setting ready to play");
    });
}
// RPS button clicked
$(document).on("click", ".playButtons", function (event) {
    event.preventDefault();
    var buttonClicked = event.target.id;
    console.log(buttonClicked);
    bPlayed = true;
    const playerRef = firestore.collection('players').doc(sSelf);
    playerRef.set({
        sPlayed: buttonClicked
    }).then(function () {
        console.log(`Played ${buttonClicked}`);
    }).catch(function (error) {
        console.log("Error setting button clicked");
    });

});

function RPSButtons(sOtherPlayer) {
    $("#opponent").text(`You are playing against ${sOtherPlayer}`);
    var r;
    r = $('<input/>').attr({
        type: "button",
        id: "rock",
        value: 'Rock',
        style: "height: 40px",
    });
    $(".playButtons").append(r);
    r = $('<input/>').attr({
        type: "button",
        id: "paper",
        value: 'Paper',
        style: "height: 40px",
    });
    $(".playButtons").append(r);
    r = $('<input/>').attr({
        type: "button",
        id: "scissors",
        value: 'Scissors',
        style: "height: 40px",
    });
    $(".playButtons").append(r);
}


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
/*
console.log("test");
exports.helloWorld = functions.https.onRequest((request, response) => {
    console.log('test');
    response.send("Hello from Firebase to you!");
});
*/