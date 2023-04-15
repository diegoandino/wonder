const { MongoClient } = require("mongodb");
const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const PORT = process.env.EXPRESS_PORT;
const app = express();

const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PWD}@wonder-cluster-0.ukwuhud.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/login", (req, res) => {
  client.connect(async (err) => {
    const username = req.body["username"];
    const longitude = req.body["location"]["longitude"];
    const latitude = req.body["location"]["latitude"];
    const spotifyProfilePicture = req.body["spotifyProfilePicture"];
    const users = client.db("Main").collection("Users");

    // If username doesn't exist, create new user
    const userNameExists = await users.findOne({ username: username });
    if (!userNameExists) {
      users.insertOne({
        username: username,
        location: {
          lat: latitude,
          lng: longitude,
        },
        logged_in: true,
        spotifyProfilePicture: spotifyProfilePicture,
        currentPlaybackState: {},
      });
      res.send("Inserted a new user");
    }
  });
});

app.post("/update_user", (req, res) => {
  const users = client.db("Main").collection("Users");
  const longitude = req.body["location"]["longitude"];
  const latitude = req.body["location"]["latitude"];
  const loggedIn = req.body["logged_in"];
  const currentPlaybackState = req.body["currentPlaybackState"];
  try {
    const filter = { username: req.body["username"] };
    users.findOneAndUpdate(
      filter,
      {
        $set: {
          location: { lat: latitude, lng: longitude },
          logged_in: loggedIn,
          currentPlaybackState: currentPlaybackState,
        },
      },
      (err, doc) => {
        if (err) console.log("Error in update_user find(): ", err);
        else console.log("Updated user");
      }
    );
  } catch (err) {
    console.log("Error in update_user: ", err);
  }
});

// get current user from db
app.get("/get_user/:username", (req, res) => {
  const users = client.db("Main").collection("Users");
  const username = req.params.username;
  try {
    users.findOne({ username: username }, (err, doc) => {
      if (err) console.log("Error in get_user find(): ", err);
      else res.send(doc);
    });
  } catch (err) {
    console.log("Error in get_user: ", err);
  }
});

// get all users from database that are logged in
app.get("/get_logged_in_users", (req, res) => {
  client.connect((err) => {
    const collection = client.db("Main").collection("Users");

    // Filter out current user and return all other logged in users
    collection.find({ logged_in: true }).toArray((err, docs) => {
      if (err) {
        console.log("Error in get_logged_in_users: ", err);
      } else {
        res.send(docs);
      }
    });
  });
});

app.listen(PORT, "10.100.1.141");
