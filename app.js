const express = require('express');
const axios = require('axios');
const request = require('request');
const Twitter = require('twitter');

const app = express();

var client = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
});

client.stream('statuses/filter', {track: 'rocky horror show, rocky, horror', language: 'en'}, stream => {
    stream.on('data', tweet => {
        if(tweet.text.substring(0, 2) == 'RT') {
            console.log("----------------------------------------------------")
            console.log("Retweet: " + tweet.text);
        } else {
            console.log("----------------------------------------------------");
            console.log(tweet.text);
        }
    });

    stream.on('error', error => {
        console.log(error);
    });
});

var port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
