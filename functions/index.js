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
const newPlayer = document.querySelector("#newPlayer");
const playButton = document.querySelector("#playBtn");
const againButton = document.querySelector("#againBtn");
const sendButton = document.querySelector("#sendBtn");

var sSelf = "";
var sOpponent = "";
var sSelfPlayed = "";
var sOpponentPlayed = "";
var bReadyToPlay = false;
var iYourWins = 0;
var iYourLosses = 0;
var bGotOpponent = false;
var bTooManyPlayers = false;

$("#waiting").hide();
$("#newPlayer").show();
$("#playBtn").show();
$("#againBtn").hide();
$("#msgToSend").hide();
$("#sendBtn").hide();
$("#sorry").hide();

// "Send" button
sendButton.addEventListener("click", function () {
    sendMsg(sSelf, msgToSend.value.trim());
})

//Also called to "clear out" an old message
function sendMsg(sOwner, sMsg) {
    collRef.doc(sOwner).update({
        Text: sMsg
    }).then(function () {
        console.log('Message sent');
        msgToSend.value = "";
    });
}

// the play again button
againButton.addEventListener("click", function () {
    sendMsg(sSelf, "");
    $("#result").text("");
    sOpponent = ""; // we're really waiting for him
    sSelfPlayed = "";
    sOpponentPlayed = "";
    $('#opponent').text("Waiting ...");
    bReadyToPlay = true;
    collRef.doc(sSelf).update({
        bReadyToPlay: bReadyToPlay
    });
    $(".playBtn").remove();
    bGotOpponent = false; // because we're waiting for them
    $("#winLose").text('');
    $("#againBtn").hide();
    $(".playButtons").show();
})

// "play" button (after entering your name)
playButton.addEventListener("click", function () {
    var bFoundUser = false;
    var sPlayerToAdd;

    event.preventDefault();
    // Look for two users at "ready to play"
    let playerRef = collRef.where('bReadyToPlay', '==', true);
    playerRef.get().then(snapshot => {
        //        console.log ("snapshot size: " + snapshot.size);
        if (snapshot.size >= 2) {
            bTooManyPlayers = true;
            console.log("Too many players");
            $("#sorry").show();
        } else {
            bTooManyPlayers = false;
            sPlayerToAdd = newPlayer.value.trim();
            playerRef = collRef.doc(sPlayerToAdd);
            playerRef.get({}).then(doc => {
                if (doc.exists) {
                    console.log("Existing player");
                    iYourWins = doc.data().iYourWins;
                    iYourLosses = doc.data().iYourLosses;
                    console.log(typeof (iYourWins));
                    if (isNaN(iYourWins)) {
                        iYourWins = 0;
                    }
                    if (isNaN(iYourLosses)) {
                        iYourLosses = 0;
                    }
                    collRef.doc(sPlayerToAdd).update({
                        // deals with "stopped in the middle" condition
                        bReadyToPlay: false,
                        sPlayed: ""
                    });
                } else {
                    console.log("New player");
                    collRef.doc(sPlayerToAdd).set({ // Must use set here
                        First_name: sPlayerToAdd,
                        bReadyToPlay: false,
                        sPlayed: ""
                    });
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
        }
    });
});

// hear when the other guy changes something (or you do!)
// could possibly be made cleaner by using .where in the query
// and splitting this into multiple routines
collRef.onSnapshot(docSnapshot => {
    var sPlayer;
    docSnapshot.forEach(doc => {
        console.log(doc.data());
        if (doc.data().bReadyToPlay === true) { // opponent came online
            sPlayer = doc.data().First_name;
            if (sSelf != "" && sPlayer != sSelf) {
                sOpponent = sPlayer;
            }
        }
        if (doc.data().First_name === sOpponent && // message from opponent?
            doc.data().Text != undefined &&
            doc.data().Text.length > 0) {
            $("#msgRcvd").text(`${sOpponent} says: ${doc.data().Text}`);
        }
        if (doc.data().sPlayed != "") {
            // someone (either me or the other guy) has played
            if (doc.data().First_name != sSelf) {
                sOpponentPlayed = doc.data().sPlayed;
                if (sSelfPlayed != "") {
                    // we have both played
                    WinLose();
                }
            }
        }
    });
    if (bReadyToPlay && (sOpponent != "") && !bTooManyPlayers) {
        ReadyToPlay();
    }
});

// when the player has clicked Play, or after he's hit Again
function ReadyToPlay() {
    if (bGotOpponent == true) {
        return;
    }
    console.log("Ready to play set");
    if (sOpponent == "") {
        const playerRef = collRef.where('bReadyToPlay', '==', true);
        playerRef.get().then(snapshot => {
            snapshot.forEach(doc => {
                if (sOpponent === "") {
                    sOpponent = doc.data().First_name;
                    if (sOpponent === sSelf) {
                        sOpponent = "";
                    } else {
                        bGotOpponent = true;
                        console.log(`You are playing against ${sOpponent}`);
                    }
                }
            });
        });
    } else {
        bGotOpponent = true;
        console.log(`Playing against existing player ${sOpponent}`);
    }
    bReadyToPlay = true;
    collRef.doc(sSelf).update({
        bReadyToPlay: true
    }).then(doc => {
        console.log("Setting ready to play");
        if (sOpponent != "") {
            $("#yourName").hide();
            $("#waiting").hide();
            $("#newPlayer").hide();
            $("#playBtn").hide();
            $("#msgToSend").show();
            $("#sendBtn").show();
            RPSButtons(sOpponent);
        } else {
            $("#waiting").show();
        }
    }).catch(function (error) {
        console.log("Error setting ready to play");
    });
}

// RPS button clicked
$(document).on("click", ".playButtons", function (event) {
    event.preventDefault();
    if (sSelfPlayed != "") {
        return; // already picked one
    }
    sSelfPlayed = event.target.id;
    $(".playButtons").hide();
    console.log(sSelfPlayed);
    const playerRef = collRef.doc(sSelf);
    $("#winLose").text(`You played: ${sSelfPlayed}`);
    playerRef.update({
        sPlayed: sSelfPlayed
    }).then(function () {
        console.log(`Played ${sSelfPlayed}`);
    }).catch(function (error) {
        console.log("Error setting button clicked");
    });
});

// show the RPS buttons
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

// both have played - figure out whether you won or lost
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
            sWL = "Tie!";
            sResult = "and";
            break;
        case 2:
            sWL = "You win!!!";
            sResult = "beats";
            iYourWins++;
            break;
    }
    $("#winLose").text(`${sSelfPlayed} ${sResult} ${sOpponentPlayed}`);
    collRef.doc(sSelf).update({
        iYourWins: iYourWins,
        iYourLosses: iYourLosses,
        bReadyToPlay: false,
        sPlayed: ""
    });
    $("#yourWins").text(`Your wins: ${iYourWins}`).show();
    $("#yourLosses").text(`Your losses: ${iYourLosses}`).show();
    bReadyToPlay = false;
    sSelfPlayed = "";
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