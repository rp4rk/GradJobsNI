// Requirements
var async = require('async');
var env = require('node-env-file');
var mongodb = require('mongodb');
var Twitter = require('twitter');
var schedule = require('node-schedule');

var scrape = require('./scrape.js');

// Environment vars
env('./config/config.env');

// Array Filter - Remove duplicate jobs
function uniq(a) {
  // Create a flat array with our IDs
  var flat = [];
  for (var x=0; x<a.length; x++) {
    flat[x] = a[x].id;
  } ;
  
  // Compare each ID and return the first of each
  var uniqueJobs = a.filter(function(elem, pos) {
    return flat.indexOf(elem.id) == pos;
  });
  
  return uniqueJobs;
}

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

// Configure what we want to scrape
var scrapeTasks = [ 
  {
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
  },
  {
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
  },
  {
    url : 'http://www.indeed.co.uk/graduate-jobs-in-Northern-Ireland',
    rootSelector: '.result',
    selectors: {
      title: '.turnstileLink@title',
      link: '.turnstileLink@href',
      id: '@id'
    },
    pagination: '.pagination a:last-child@href',
    limit: 12
  },
  {
    url : 'http://www.indeed.co.uk/junior-jobs-in-Northern-Ireland',
    rootSelector: '.result',
    selectors: {
      title: '.turnstileLink@title',
      link: '.turnstileLink@href',
      id: '@id'
    },
    pagination: '.pagination a:last-child@href',
    limit: 12
  },
  {
    url : 'http://www.nijobs.com/ShowResults.aspx?Keywords=Graduate+Junior&Location=31&Category=&Recruiter=Company&Recruiter=Agency',
    rootSelector: '.job-result',
    selectors: {
      title: '.job-result-title h2 a',
      link: '.job-result-title h2 a@href',
    },
    pagination: '#pagination li:last-child a@href',
    limit: 6,
    customTransforms : [
      function(url) {
        var id = url.match(/\d{7}/g)[0];

        return {
          property: 'id',
          value: id
        }
      }
    ]
  },
];


// Scrape!
var initScrape;
(initScrape = function() {
  
  var jobArray = [];
  
  // Scrape each task, append it into job array
  async.each(scrapeTasks, function(task, taskDone) {
    // Scrape each task, tweet, then log
    scrape.job(task, function(jobs) {
      jobArray = jobArray.concat(jobs)
      taskDone();
    })
  }, function(err) {
    
    // Filter out duplicates
    var jobs = uniq(jobArray);
    var jobTotalCount = jobArray.length;
    var jobsFilteredCount = jobs.length;
    var ignoredCount = 0;

    // Add to MongoDB
    MongoClient.connect(mongoURL, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        // Connected!
        console.log('Connection established to', mongoURL);
        var collection = db.collection('jobs');
        
        // Iterate through jobs
        async.each(jobs, function(job, callback) {
          collection.find({id: job.id}).toArray(function (err, result) {
            if (err) {
              // Error
              console.log(err);
            } else if (result.length) {
              // Duplicate
              //console.log(job.title + " - is a duplicate, ignoring.");
              ignoredCount++;
              callback();
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
          // Job's done, post stats
          console.log("Total Jobs: " + jobsFilteredCount);
          console.log("Total Before Filter: " + jobTotalCount);
          console.log("Total Jobs Ignored: " + ignoredCount);
          
          console.log("Mission Accomplished");
          db.close();
        })
      }
    }); 
    
  })
  

}
)()

// Schedule every 6 minutes
var j = schedule.scheduleJob('*/1 * * * *', function() { initScrape() });