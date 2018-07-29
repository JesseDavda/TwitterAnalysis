"use strict";

//importing various libraries
const express = require('express');
const axios = require('axios');
const request = require('request');
const Twitter = require('twitter');
const moment = require('moment');
const fs = require('fs');

const app = express();
//setting up the websocket
const server = app.listen(8082);
const io = require('socket.io').listen(server);

//Reading the JSON object saved to the file and assiging variables
var dataObj = JSON.parse(fs.readFileSync('./data.json', 'utf8')),
    total_tweets = dataObj.total_tweets,
    average_followers = dataObj.average_followers,
    total_followers = dataObj.total_followers,
    average_favorites = dataObj.average_followers,
    total_favorites = dataObj.total_favorites,
    average_retweets = dataObj.average_retweets,
    total_retweets = dataObj.total_retweets,
    day_data = dataObj

console.log(total_tweets);

io.on('connection', (socket) => {
    var starterObj = {
        total_tweets: total_tweets,
        average_retweets: average_retweets,
        average_favorites: average_favorites,
        average_followers: average_followers,
        day_data: dataObj.day_data,
    }

    socket.emit("Starting Values", starterObj);

});

//credentials for the twitter API
var client = new Twitter({
    consumer_key: 'SKRkMxR59nLZQAL84yKt977ue',
    consumer_secret: 'SVX0NDvQaGBbTWR3vM8jfXBSjc5axwfUpE1eQAhUNeIyWiXhOe',
    access_token_key: '1021330277631655936-TxcGnnEls7zEwRGolARSzogVP4AHq1',
    access_token_secret: 'PC9LkNV2GcadYz58i9GJyfqHsm6r4nU8AjOc3Zd682Em2'
});

var found, day_tweets, index;

//{track: "Rocky Horror Show, Richard O'Brien, Rocky Horror Picture Show, Rocky Horror Show, frankenfurter, frank-en-furter, sweet transvestite", language: 'en'}
client.stream('statuses/filter', {track: 'football'}, stream => {

    stream.on('data', async (tweet) => {
        //incrementing the variables and recalculating the averages per tweet
        total_tweets++;
        total_followers += tweet.user.followers_count;
        average_followers = Math.ceil(total_followers / total_tweets);
        average_favorites = Math.ceil(total_favorites / total_tweets);
        average_retweets = Math.ceil(total_retweets / total_tweets);

        //All tweets are new so if they are retweets we use the original tweets favorite and retweet data
        if(tweet.retweeted_status != undefined) {
            total_retweets += tweet.retweeted_status.retweet_count;
            total_favorites += tweet.retweeted_status.favorite_count;
        }

        //console.log(tweet);

        //Change the format of the date from the format that is given in the twitter API to DD/MM/YY
        var date = await moment(tweet.created_at, "ddd MMM DD HH:mm:ss Z YYYY").format("DD/MM/YY");

        //Checking if the current date is already part of the array
        found = await dataObj.day_data.some(data => {
            return data.date == date;
        });

        //if it is then we just increment the number of tweets for that date object
        if(found) {
            index = await dataObj.day_data.findIndex(i => i.date == date);
            dataObj.day_data[index].day_tweets++;
        } else {
        //Otherwise we create a new object and push it to the array of date objects
            var newDay = {
                "date": date,
                "day_tweets": 1
            }
            dataObj.day_data.push(newDay);
        }

        //Every 50 tweet objects that are recieved from the API we save the data to the JSON file
        if(total_tweets % 50 == 0) {
            var data = {
                "total_tweets": total_tweets,
                "average_followers": average_followers,
                "total_followers": total_followers,
                "average_favorites": average_favorites,
                "total_favorites": total_favorites,
                "average_retweets": average_retweets,
                "total_retweets": total_retweets,
                "day_data": dataObj.day_data
            }

	    var writeData = JSON.stringify(data);

            fs.writeFile("./data.json", writeData, (err, data) => {
                if(err) console.log(err);
                console.log('File Saved');
            });
        }
        //console.log("days ----------- ", dataObj.day_data);

        //This is the JSON object created that will be emitted across the socket in real time to the client
        var tweetObj = {
            total_tweets: total_tweets,
            location: tweet.user.location,
            average_retweets: average_retweets,
            average_favorites: average_favorites,
            average_followers: average_followers,
            day_data: dataObj.day_data[index]
        };

        console.log("=======================");
        console.log(tweetObj);

        io.sockets.emit('New Tweet', tweetObj);
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
