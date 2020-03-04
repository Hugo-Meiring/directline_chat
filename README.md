# Setup

This has been tested with iOS (Android should also work fine)

1. Clone project
2. In `App.js` replace line 166: *'https://<< token generation endpoint >>'* with your token generation endpoint 
3. Run `yarn && yarn start` in the root of the project
4. In a second terminal `cd ios` and run `pod install` 
5. Run `yarn ios`

# Structure

All important code related to directline is found in the `App.js`. You will see I have imported a Directline (0.11.6) directly to the root of the file. This was for easy of testing. You can swap it out with the import of the node module instead.

Note I have disabled react yellow box warnings in the index.js for testing purposes. Finally using react-native-gifted-chat for the UI.

# Issues

See the sample output below to see where I successfully send 2 responses to our bot before expiring the token and send a valid response but fails because of token expiry.

I then received my entire history back ( x2 ) and then ( 3x ) connections are active after directline recovers.

# Sample output
<pre>
Running application hx_chat ({
    initialProps =     {
    };
    rootTag = 11;
})
infoLog.js:16 Running "hx_chat" with {"rootTag":11,"initialProps":{}}
App.js:170 🌀 Fetching directline token:
{"conversationId":"--- Valid conversation id --- ","token":"--- Valid token ---","expires_in":3600,"error":null}
RCTLog.js:47 SocketRocket: In debug mode.  Allowing connection to any root cert
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000000", timestamp: "2020-03-04T14:05:57.9805697Z", serviceUrl: "https://directline.botframework.com/", channelId: "directline", …}
App.js:246 🦋 Posted activity, assigned ID  9xDUEfBBGxjCeU3J78TBCR-h|0000000
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000002", timestamp: "2020-03-04T14:06:00.9189056Z", channelId: "directline", from: {…}, …}
App.js:186 💦 2
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000001", timestamp: "2020-03-04T14:06:00.7549971Z", channelId: "directline", from: {…}, …}
App.js:186 💦 1
App.js:246 🦋 Posted activity, assigned ID  9xDUEfBBGxjCeU3J78TBCR-h|0000003
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000003", timestamp: "2020-03-04T14:09:46.8133579Z", serviceUrl: "https://directline.botframework.com/", channelId: "directline", …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000004", timestamp: "2020-03-04T14:09:48.3481562Z", channelId: "directline", from: {…}, …}
App.js:186 💦 4
App.js:225 Causing token to fail 🔫
App.js:97 Status: Expired token 〽️
App.js:246 🦋 Posted activity, assigned ID  retry
App.js:266 🥗 Retrying ....
3RCTLog.js:47 SocketRocket: In debug mode.  Allowing connection to any root cert
App.js:246 🦋 Posted activity, assigned ID  9xDUEfBBGxjCeU3J78TBCR-h|0000005
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000005", timestamp: "2020-03-04T14:09:58.3734481Z", serviceUrl: "https://directline.botframework.com/", channelId: "directline", …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000000", timestamp: "2020-03-04T14:05:57.9805697Z", serviceUrl: "https://directline.botframework.com/", channelId: "directline", …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000001", timestamp: "2020-03-04T14:06:00.7549971Z", channelId: "directline", from: {…}, …}
App.js:186 💦 1
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000002", timestamp: "2020-03-04T14:06:00.9189056Z", channelId: "directline", from: {…}, …}
App.js:186 💦 2
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000003", timestamp: "2020-03-04T14:09:46.8133579Z", serviceUrl: "https://directline.botframework.com/", channelId: "directline", …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000004", timestamp: "2020-03-04T14:09:48.3481562Z", channelId: "directline", from: {…}, …}
App.js:186 💦 4
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000005", timestamp: "2020-03-04T14:09:58.3734481Z", serviceUrl: "https://directline.botframework.com/", channelId: "directline", …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000000", timestamp: "2020-03-04T14:05:57.9805697Z", serviceUrl: "https://directline.botframework.com/", channelId: "directline", …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000001", timestamp: "2020-03-04T14:06:00.7549971Z", channelId: "directline", from: {…}, …}
App.js:186 💦 1
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000002", timestamp: "2020-03-04T14:06:00.9189056Z", channelId: "directline", from: {…}, …}
App.js:186 💦 2
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000003", timestamp: "2020-03-04T14:09:46.8133579Z", serviceUrl: "https://directline.botframework.com/", channelId: "directline", …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000004", timestamp: "2020-03-04T14:09:48.3481562Z", channelId: "directline", from: {…}, …}
App.js:186 💦 4
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000005", timestamp: "2020-03-04T14:09:58.3734481Z", serviceUrl: "https://directline.botframework.com/", channelId: "directline", …}
App.js:182 🧪 Received activity:  {type: "event", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000006", timestamp: "2020-03-04T14:10:03.9260128Z", channelId: "directline", from: {…}, …}
App.js:186 💦 6
App.js:182 🧪 Received activity:  {type: "event", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000006", timestamp: "2020-03-04T14:10:03.9260128Z", channelId: "directline", from: {…}, …}
App.js:182 🧪 Received activity:  {type: "event", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000006", timestamp: "2020-03-04T14:10:03.9260128Z", channelId: "directline", from: {…}, …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000007", timestamp: "2020-03-04T14:10:04.5180665Z", channelId: "directline", from: {…}, …}
App.js:186 💦 7
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000007", timestamp: "2020-03-04T14:10:04.5180665Z", channelId: "directline", from: {…}, …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000007", timestamp: "2020-03-04T14:10:04.5180665Z", channelId: "directline", from: {…}, …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000008", timestamp: "2020-03-04T14:10:07.0579041Z", channelId: "directline", from: {…}, …}
App.js:186 💦 8
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000008", timestamp: "2020-03-04T14:10:07.0579041Z", channelId: "directline", from: {…}, …}
App.js:182 🧪 Received activity:  {type: "message", id: "9xDUEfBBGxjCeU3J78TBCR-h|0000008", timestamp: "2020-03-04T14:10:07.0579041Z", channelId: "directline", from: {…}, …}
RCTLog.js:47 SocketRocket: In debug mode.  Allowing connection to any root cert
</pre>