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

//const docRef = firestore.collection('players').doc('b');
// or firestore.doc ("players/Pat");
const collRef = firestore.collection('players');
const h1 = document.querySelector("#h1");
const newPlayer = document.querySelector("#newPlayer");
const playButton = document.querySelector("#playBtn");

var sSelf = "";
var sOpponent = "";
var sSelfPlayed = "";
var sOpponentPlayed = "";
var bReadyToPlay = false;
var bFirstTime = true;

// "play" button
playButton.addEventListener("click", function () {
    var bFoundUser = false;
    var sPlayerToAdd;

    event.preventDefault();
    sPlayerToAdd = newPlayer.value.trim();
    console.log("Adding player ", sPlayerToAdd);
    const playerRef = firestore.collection('players').doc(sPlayerToAdd);
    playerRef.get()
        .then(doc => {
            if (doc.exists) {
                console.log("Existing player");
            } else {
                console.log("New player");
                collRef.doc(sPlayerToAdd).set({
                    First_name: sPlayerToAdd
                }).then(function () {
                    console.log("Player added");
                }).catch(function (error) {
                    console.log("Error adding player");
                });
            }
            sSelf = sPlayerToAdd;
            collRef.doc(sPlayerToAdd).update({
                bReadyToPlay: true,
                sPlayed: ""
            }).then(function () {
                console.log("Ready to play set");
                console.log("All set!");
                ReadyToPlay("");
            }).catch(function (error) {
                console.log("Error setting ready to play");
            });
        });
})

// hear when the other guy changes something
var observer = collRef.onSnapshot(docSnapshot => {
    //    console.log(`Received doc snapshot: ${docSnapshot}`);
    var sPlayer;
    docSnapshot.forEach(doc => {
        if (doc.data().bReadyToPlay == true) { // will run twice, but never mind
            sPlayer = doc.data().First_name;
            if (sSelf != "" && sPlayer != sSelf) {
                sOpponent = sPlayer;
            }
        }
        if (doc.data().sPlayed != undefined && doc.data().sPlayed != "") {
            if (doc.data().First_name != sSelf) {
                sOpponentPlayed = doc.data().sPlayed;
                if (sSelfPlayed != "") {
                    // we have both played
                    WinLose();
                }
            }
        }
    });
    if (bReadyToPlay && (sOpponent != "")) {
        ReadyToPlay();
    }
}, err => {
    console.log(`Encountered error: ${err}`);
});

function ReadyToPlay() {
    if (bFirstTime === false) {
        return;
    }
    console.log("Ready to play set");
    bFirstTime = false;
    if (sOpponent == "") {
        bFirstTime = true;      // let us come through again
        playerRef = collRef.where('bReadyToPlay', '==', true);
        playerRef.get().then(snapshot => {
            snapshot.forEach(doc => {
                if (sOpponent === "") {
                    sOpponent = doc.data().First_name;
                    if (sOpponent === sSelf) {
                        sOpponent = "";
                    } else {
                        console.log(`You are playing against ${sOpponent}`);
                    }
                }
            });
        });
    } else {
        console.log(`Playing against existing player ${sOpponent}`);
//        RPSButtons(sOpponent);
    }
    bReadyToPlay = true;
    collRef.doc(sSelf).update({
        bReadyToPlay: true
    }).then(doc => {
        console.log("Setting ready to play");
        if (sOpponent != "") {
            RPSButtons(sOpponent);
        }
    }).catch(function (error) {
        console.log("Error setting ready to play");
    });
}

// RPS button clicked
$(document).on("click", ".playButtons", function (event) {
    event.preventDefault();
    sSelfPlayed = event.target.id;
    console.log(sSelfPlayed);
    sSelfPlayed = sSelfPlayed;
    const playerRef = firestore.collection('players').doc(sSelf);
    playerRef.update({
        sPlayed: sSelfPlayed
    }).then(function () {
        console.log(`Played ${sSelfPlayed}`);
    }).catch(function (error) {
        console.log("Error setting button clicked");
    });
    if (sOpponentPlayed != "") {
        // we have both played
        WinLose();
    }
});

function RPSButtons(sOpponent) {
    $("#opponent").text(`You are playing against ${sOpponent}`);
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

aiWinLose = [1, 0, 2, 2, 1, 0, 0, 2, 1];

function WinLose() {
    var iWinLose;
    var iSelf = sSelfPlayed === "rock" ? 0 : sSelfPlayed === "paper" ? 1 : 2;
    var iOpponent = sOpponentPlayed === "rock" ? 0 : sOpponentPlayed === "paper" ? 1 : 2;

    iWinLose = aiWinLose[3 * iSelf + iOpponent];
    switch (iWinLose) {
        case 0:
            sWL = "You lose!  :-(";
            break;
        case 1:
            sWL = "Tie";
            break;
        case 2:
            sWL = "You win!!!";
            break;
    }
    collRef.doc(sSelf).update({
        bReadyToPlay: false,
        sPlayed: ""
    }).then(function () {
        console.log("I'm cleared out");
    }).catch(function (error) {
        console.log("Error clearing");
    });
    bReadyToPlay = false;
    sPlayed = "";
    sOpponent = "";
    sOpponentPlayed = "";
    bFirstTime = true;
    $(".playBbuttons").remove ();

    $("#result").text(sWL);

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