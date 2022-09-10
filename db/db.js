const { MongoClient } = require("mongodb");
const express = require('express');
const bodyParser = require("body-parser");

require('dotenv').config();

const PORT = process.env.EXPRESS_PORT;
const app = express();

const uri =
  `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PWD}@wonder-cluster-0.ukwuhud.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);
let currentUsername = '';

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/login', (req, res) => {
    client.connect(async err => {
        const username = req.body['username'];
        const longitude = req.body['location']['longitude'];
        const latitude = req.body['location']['latitude'];
        const spotifyProfilePicture = req.body['spotifyProfilePicture'];
        const users = client.db("Main").collection("Users");
        currentUsername = username;

        // If username doesn't exist, create new user
        const userNameExists = await users.findOne({"username": username});
        if (!userNameExists) {
            users.insertOne({
                username: username,
                location: {
                    lat: latitude,
                    lng: longitude
                },
                logged_in: true,
                spotifyProfilePicture: spotifyProfilePicture
            });
            res.send("Inserted a new user");
        }
    });
});

app.post('/update_user', (req, res) => {
    const users = client.db("Main").collection("Users");
    const longitude = req.body['location']['longitude'];
    const latitude = req.body['location']['latitude'];
    try {
        const filter = { username: req.body['username'] };
        users.findOneAndUpdate(filter, 
            { $set: { location: { lat: latitude, lng: longitude } } },
            (err, doc) => { 
                if (err) 
                    console.log('Error in update_user find(): ', err) 
        });
    }
    catch (err) {
        console.log('Error in update_user: ', err);
    }
});

// get all users from database that are logged in
app.get('/get_logged_in_users', (req, res) => {
    client.connect(err => {
        const collection = client.db("Main").collection("Users");
        console.log(currentUsername);
        
        // Filter out current user and return all other logged in users
        collection.find({ logged_in: true, username: { $ne: currentUsername } }).toArray((err, docs) => {
            if (err) {
                console.log('Error in get_logged_in_users: ', err);
            }
            else {
                console.log('Current logged in users: ', docs);
                res.send(docs);
            }
        });
    });
});

app.listen(PORT, '10.100.1.141');