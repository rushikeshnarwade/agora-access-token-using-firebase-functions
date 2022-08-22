const functions = require("firebase-functions");
const {RtcTokenBuilder, RtcRole} = require("agora-access-token");

const admin = require("firebase-admin");
admin.initializeApp();


exports.videoToken = functions.region("asia-south1")
    .https.onCall(async function(data, context) {
      // unique integer uid for the user to join the channel
      // this is unsigned 32 bit integer from 1 to (2^32 - 1)
      const uid = data.uid;

      const appID = "<- App ID from your agora console ->";
      const appCertificate = "<- App Certificate from agora console ->";

      // if your app is going to have multiple users and they gonna have
      // videocall with different users then try to keep the bellow
      // channel string unique
      const channelName = "<- channel for video meet ->";

      // keep role as publisher if user if going to participate
      // in video/audio conversations
      // otherwise keep it RtcRole.SUBSCRIBER if user is only going to listen
      // or see others
      const role = RtcRole.PUBLISHER;

      // expiraton time nothing but the time for which the token will be active
      // here we are allowing user to use the token for 1 hr
      const expirationTimeInSeconds = 3600;

      // current timestamp in second to calculate token end time
      const currentTimestamp = Math.floor(Date.now() / 1000);

      // calculating the endtime by adding token duration into current time
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // now it's time to build the function with the bellow line of code
      const userToken = RtcTokenBuilder.buildTokenWithUid(appID,
          appCertificate, channelName, uid, role, privilegeExpiredTs);

      // here I am storing the token in users document
      // you can skip this and direct return the token
      const db = admin.firestore();
      await db.collection("users").doc(context.auth.uid)
          .update({user_token: userToken});

      return {error: "Please select date within next 7 days"};
    });
