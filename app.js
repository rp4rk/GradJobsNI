// Requirements
var async = require('async');
var env = require('node-env-file');
var mongodb = require('mongodb');
var Twitter = require('twitter')

var scrape = require('./scrape.js');

// Environment vars
env('/home/GradJobsNI/config/config.env');

// Twitter setup
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Mongo Setup
var mongoURL = process.env.MONGO_URL;
var MongoClient = mongodb.MongoClient;

var postTweets = function(jobs) {
  
  // Connect to MongoDB
  MongoClient.connect(mongoURL, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      // Connected!
      console.log('Connection established to', mongoURL);
      
      // Set collection to jobs
      var collection = db.collection('jobs');
      
      // Check jobs against existing jobs
      async.each(jobs, function(job, callback) {
        // If we can find the job, ignore it otherwise 
        collection.find({id: job.id}).toArray(function (err, result) {
          if (err) {
            // Error
            console.log(err);
          } else if (result.length) {
            // Duplicate
            // console.log(job.title + " - is a duplicate, ignoring.");
          } else {
            // New Job, tweet about it!
            var tweetString = job.title + " - " + job.link;
            
            client.post('statuses/update', {
              status: tweetString
            },  
            function(error, tweet, response){
              if(error) throw error;
              //console.log(tweet); 
              //console.log(response); 
            });
            
            // Add to our records
            collection.insert(job, function (err, result) {
              if (err) {
                console.log(err);
               } else {
                console.log('Added Job - ' + job.title + ' succesfully.');
                callback();
               }
            });   
          }
        });
      }, function(err) {
        console.log("Finished Cycle");
        // Close
        db.close();
      })
    
      
    }
  });
  
  
}

// Scrape configure objects

var niJobFinderGrads = {
  url : 'http://www.nijobfinder.co.uk/search/262329691/Page1/',
  rootSelector : '.result',
  selectors : {
    title: '.job-title a',
    image: '.recruiter-logo@src',
    link: '.job-title a@href'
  },
  pagination: '.next a@href',
  limit: 10,
  customTransforms : [
    function(url) {
      var id = url.match(/\/\d{6}\//g)[0].replace('/', '');
      id = id.replace('/', '');
      
      return {
        property: 'id',
        value: id
      }
    }
  ]
}

var niJobFinderJuniors = {
  url : 'http://www.nijobfinder.co.uk/search/262330730/Page1/',
  rootSelector : '.result',
  selectors : {
    title: '.job-title a',
    image: '.recruiter-logo@src',
    link: '.job-title a@href'
  },
  pagination: '.next a@href',
  limit: 10,
  customTransforms : [
    function(url) {
      var id = url.match(/\/\d{6}\//g)[0].replace('/', '');
      id = id.replace('/', '');
      
      return {
        property: 'id',
        value: id
      }
    }
  ]
}

var indeedGrads = {
  url : 'http://www.indeed.co.uk/graduate-jobs-in-Northern-Ireland',
  rootSelector: '.result',
  selectors: {
    title: '.turnstileLink@title',
    link: '.turnstileLink@href',
    id: '@id'
  },
  pagination: '.pagination a:last-child@href',
  limit: 12
}

var indeedJuniors = {
  url : 'http://www.indeed.co.uk/junior-jobs-in-Northern-Ireland',
  rootSelector: '.result',
  selectors: {
    title: '.turnstileLink@title',
    link: '.turnstileLink@href',
    id: '@id'
  },
  pagination: '.pagination a:last-child@href',
  limit: 12
}


// Scrape!

scrape.job(indeedGrads, function(jobs) {
  postTweets(jobs);
})

scrape.job(indeedJuniors, function(jobs) {
  postTweets(jobs);
})

scrape.job(niJobFinderGrads, function(jobs) {
  postTweets(jobs);
})

scrape.job(niJobFinderJuniors, function(jobs) {
  postTweets(jobs);
})






