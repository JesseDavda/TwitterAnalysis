"use strict";

const express = require('express');
const axios = require('axios');
const request = require('request');
const Twitter = require('twitter');
const fs = require('fs');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var dataObj = JSON.parse(fs.readFileSync('./database.json', 'utf8')),
    total_tweets = dataObj.total_tweets,
    average_followers = dataObj.average_followers,
    total_followers = dataObj.total_followers,
    average_favorites = dataObj.average_followers,
    total_favorites = dataObj.total_favorites,
    average_retweets = dataObj.average_retweets,
    total_retweets = dataObj.total_retweets;

console.log(total_tweets);

io.on('connection', (socket) => {
    console.log("A user connected");
});

var client = new Twitter({
    consumer_key: 'SKRkMxR59nLZQAL84yKt977ue',
    consumer_secret: 'SVX0NDvQaGBbTWR3vM8jfXBSjc5axwfUpE1eQAhUNeIyWiXhOe',
    access_token_key: '1021330277631655936-TxcGnnEls7zEwRGolARSzogVP4AHq1',
    access_token_secret: 'PC9LkNV2GcadYz58i9GJyfqHsm6r4nU8AjOc3Zd682Em2'
});

//{track: "Rocky Horror Show, Richard O'Brien, Rocky Horror Picture Show, Rocky Horror Show, frankenfurter, frank-en-furter, sweet transvestite", language: 'en'}
client.stream('statuses/filter', {track: 'football'}, stream => {

    stream.on('data', tweet => {
        total_tweets++;
        total_followers += tweet.user.followers_count;
        total_favorites += tweet.user.faviroute_count;
        total_retweets += tweet.user.retweet_count;
        average_followers = Math.ceil(total_followers / total_tweets);
        average_favorites = Math.ceil(total_favorites / total_tweets);
        average_retweets = Math.ceil(total_retweets / total_tweets);


        var tweetObj = {
            total_tweets: total_tweets,
            location: tweet.user.location,
            average_retweets: average_retweets,
            average_favorites: average_favorites,
            average_followers: average_followers
        };

        io.emit('another retweet', tweetObj);
    });

    stream.on('error', error => {
        console.log(error);
    });
});

// var searchObj = {
//     q: "Rocky Horror Show",
//     lang: "en"
// }
//
// client.get('search/tweets', searchObj, function(error, tweets, response) {
//      //
// });

var port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
