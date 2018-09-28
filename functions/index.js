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

const collRef = firestore.collection('players');
const h1 = document.querySelector("#h1");
const newPlayer = document.querySelector("#newPlayer");
const playButton = document.querySelector("#playBtn");
const againButton = document.querySelector("#againBtn");
const sendButton = document.querySelector("#sendBtn");

var sSelf = "";
var sOpponent = "";
var sSelfPlayed = "";
var sOpponentPlayed = "";
var bReadyToPlay = false;
var bFirstTime = true;
var iYourWins = 0;
var iYourLosses = 0;

$("#waiting").hide();
$("#newPlayer").show();
$("#playBtn").show();
$("#againBtn").hide();
$("#msgToSend").hide();
$("#sendBtn").hide();

// "Send" button
sendButton.addEventListener("click", function () {
    sendMsg(sSelf, msgToSend.value.trim());
})

function sendMsg(sOwner, sMsg) {
    const msgRef = firestore.collection('players').doc(sOwner);
    msgRef.update({
        Text: sMsg
    })
    .then (function () {
        console.log ('Message sent');
        msgToSend.value = "";
    });
}

againButton.addEventListener("click", function () {
    //    $("#newPlayer").show();
    //    $("#playBtn").show();
    sendMsg(sSelf, "");
    $("#result").text("");
    sOpponent = "";     // we're really waiting for him
    sSelfPlayed = "";
    sOpponentPlayed = "";
    $('#opponent').text ("Waiting ...");
    bReadyToPlay = true;
    collRef.doc(sSelf).update({
        bReadyToPlay: bReadyToPlay
    });
    $(".playBtn").remove();
    bFirstTime = true;
    sOpponent = "";
    $("#winLose").text ('');
})

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
                iYourWins = doc.data().iYourWins;
                iYourLosses = doc.data().iYourLosses;
                console.log (typeof(iYourWins));
                if (isNaN (iYourWins)) {
                    iYourWins = 0;
                }
                if (isNaN (iYourLosses)) {
                    iYourLosses = 0;
                }
            } else {
                console.log("New player");
                collRef.doc(sPlayerToAdd).set({
                    First_name: sPlayerToAdd
                });
                /*
                .then(function () {
                    console.log("Player added");
                }).catch(function (error) {
                    console.log("Error adding player");
                });
                */
            }
            sSelf = sPlayerToAdd;
            collRef.doc(sPlayerToAdd).update({
                bReadyToPlay: true,
                sPlayed: "",
                Text: ""
            }).then(function () {
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
        if (doc.data().bReadyToPlay == true) {
            sPlayer = doc.data().First_name;
            if (sSelf != "" && sPlayer != sSelf) {
                sOpponent = sPlayer;
            }
        }
        if (doc.data().First_name === sOpponent) {
            if (doc.data().Text != undefined && doc.data().Text.length > 1) {
                $("#msgRcvd").text(`${sOpponent} says: ${doc.data().Text}`);
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
        bFirstTime = true; // let us come through again
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
            $("#waiting").hide();
            $("#newPlayer").hide();
            $("#playBtn").hide();
            $("#msgToSend").show();
            $("#sendBtn").show();
            RPSButtons(sOpponent);
        } else {
            // set up "waiting"
            $("#waiting").show();
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
//    sSelfPlayed = sSelfPlayed;
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
        class: "playBtn"
    });
    $(".playButtons").append(r);
    r = $('<input/>').attr({
        type: "button",
        id: "paper",
        value: 'Paper',
        style: "height: 40px",
        class: "playBtn"
    });
    $(".playButtons").append(r);
    r = $('<input/>').attr({
        type: "button",
        id: "scissors",
        value: 'Scissors',
        style: "height: 40px",
        class: "playBtn"
    });
    $(".playButtons").append(r);
}

aiWinLose = [1, 0, 2, 2, 1, 0, 0, 2, 1];

function WinLose() {
    let iWinLose;
    let iSelf = sSelfPlayed === "rock" ? 0 : sSelfPlayed === "paper" ? 1 : 2;
    var iOpponent = sOpponentPlayed === "rock" ? 0 : sOpponentPlayed === "paper" ? 1 : 2;
    var sResult;

    iWinLose = aiWinLose[3 * iSelf + iOpponent];
    switch (iWinLose) {
        case 0:
            sWL = "You lose!  :-(";
            iYourLosses++;
            sResult = "loses to";
            break;
        case 1:
            sWL = "Tie";
            sResult = "and";
            break;
        case 2:
            sWL = "You win!!!";
            sResult = "beats";
            iYourWins++;
            break;
    }
    $("#winLose").text (`${sSelfPlayed} ${sResult} ${sOpponentPlayed}`);
    collRef.doc(sSelf).update({
        iYourWins: iYourWins,
        iYourLosses: iYourLosses,
        bReadyToPlay: false,
        sPlayed: ""
    });
    $("#yourWins").text(`Your wins: ${iYourWins}`).show();
    $("#yourLosses").text(`Your losses: ${iYourLosses}`).show();
    /*.then(function () {
        console.log("I'm cleared out");
    }).catch(function (error) {
        console.log("Error clearing");
    });*/
    bReadyToPlay = false;
    sSelfPlayed = "";
    sOpponent = "";
    sOpponentPlayed = "";
    bFirstTime = true;

    $(".playBbuttons").remove();
    $("#againBtn").show();
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