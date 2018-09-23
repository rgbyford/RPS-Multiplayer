const functions = require('firebase-functions');
exports.playerCreated = functions.firestore
  .document('players/{playerId}')
  .onCreate(event => {
    // trigger content...
});