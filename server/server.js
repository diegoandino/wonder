const ws = require("ws");
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const https = require("https");
const SpotifyWebApi = require("spotify-web-api-node");
const { Socket } = require("socket.io");

require("dotenv").config();

const PORT = process.env.EXPRESS_PORT;
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const credentials = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
};
let spotifyApi = new SpotifyWebApi(credentials);

const setupSpotifyApi = async (code) => {
  if (code != "") {
    console.log("code:", code);
    spotifyApi.authorizationCodeGrant(code).then(
      function (data) {
        console.log("The token expires in " + data.body["expires_in"]);
        console.log("The access token is " + data.body["access_token"]);
        console.log("The refresh token is " + data.body["refresh_token"]);

        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"]);
        access_token = data.body["access_token"];
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }
};

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Socket Events
io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
  socket.on("get-current-plaback", (data) => {
    console.log(data);
    spotifyApi.getMyCurrentPlaybackState().then(
      function (data) {
        console.log("Now Playing: ", data.body);
        socket.send("response-current-playback", data.body);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  });
});

// REST ENDPOINTS
app.post("/code", (req, res) => {
  const code = req.body["code"];
  setupSpotifyApi(code);
});

app.get("/get_me", async (req, res) => {
  try {
    var result = await spotifyApi.getMe();
    res.send(result.body);
  } catch (err) {
    console.log("Something went wrong!", err);
  }
});

// get current playing track
app.get("/get_current_playing", async (req, res) => {
  try {
    var result = await spotifyApi.getMyCurrentPlayingTrack();
    res.send(result.body);
  } catch (err) {
    console.log("Something went wrong!", err);
  }
});

app.put("/play_track", async (req, res) => {
  try {
    const context = {
      context_uri: req.body["uri"],
      offset: { position: req.body["track_number"] - 1 },
      position_ms: req.body["progress_ms"],
    };

    var result = await spotifyApi.play(context);
    console.log(result);
  } catch (err) {
    console.log("Something went wrong!", err);
  }
});

server.listen(PORT, "10.100.1.141");
