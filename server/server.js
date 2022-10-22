const ws = require('ws');
const express = require('express');
const fs = require('fs');
const bodyParser = require("body-parser");
const https = require('https');
const SpotifyWebApi = require('spotify-web-api-node');

require('dotenv').config();

const PORT = process.env.EXPRESS_PORT;
const app = express();

var key = fs.readFileSync('./certs/selfsigned.key');
var cert = fs.readFileSync('./certs/selfsigned.crt');
var httpsCredentials = {
  key: key,
  cert: cert
};

const credentials = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
}
let spotifyApi = new SpotifyWebApi(credentials);

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/code',(req, res) => {
    const code = req.body['code'];
    setupSpotifyApi(code);
});

app.get('/get_me', async (req, res) => {
  try {
    var result = await spotifyApi.getMe();
    res.send(result.body)
  } catch (err) { console.log('Something went wrong!', err);}
});

// get current playing track
app.get('/get_current_playing', async (req, res) => {
  try {
    var result = await spotifyApi.getMyCurrentPlayingTrack();
    res.send(result.body)
  } catch (err) { console.log('Something went wrong!', err);}
});

const setupSpotifyApi = async (code) => {
  if (code != '') {
    console.log('code:', code);
    spotifyApi.authorizationCodeGrant(code).then(
        function(data) {
          console.log('The token expires in ' + data.body['expires_in']);
          console.log('The access token is ' + data.body['access_token']);
          console.log('The refresh token is ' + data.body['refresh_token']);
      
          // Set the access token on the API object to use it in later calls
          spotifyApi.setAccessToken(data.body['access_token']);
          spotifyApi.setRefreshToken(data.body['refresh_token']);
          access_token = data.body['access_token'];
        },
        function(err) {
          console.log('Something went wrong!', err);
        }
      );
  }
}

app.put('/play_track', async (req, res) => {
  try {
    console.log('Req: ', req.body['uri']);
    console.log('Req: ', req.body['track_number']);
    console.log('Req: ', req.body['progress_ms']);
    const context = {
      context_uri: req.body['uri'], 
      offset: {position: req.body['track_number'] - 1}, 
      position_ms: req.body['progress_ms']
    };

    var result = await spotifyApi.play(context);
    console.log(result);
  } catch (err) { console.log('Something went wrong!', err);}
});

app.listen(PORT, '10.100.1.141');

/* var httpsServer = https.createServer(httpsCredentials, app);
httpsServer.listen(PORT, () => {console.log(`Listening on ${PORT}`)}); */