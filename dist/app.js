'use strict';

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _nodeEnvFile = require('node-env-file');

var _nodeEnvFile2 = _interopRequireDefault(_nodeEnvFile);

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _twitter = require('twitter');

var _twitter2 = _interopRequireDefault(_twitter);

var _nodeSchedule = require('node-schedule');

var _nodeSchedule2 = _interopRequireDefault(_nodeSchedule);

var _scraper = require('./scraper');

var _scraper2 = _interopRequireDefault(_scraper);

var _scraperconfig = require('./scraperconfig');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Environment vars
(0, _nodeEnvFile2.default)(__dirname + '/../config/config.env');

// Array Filter - Remove duplicate jobs
// Requirements
function uniq(a) {
  // Create a flat array with our IDs
  var flat = [];
  for (var x = 0; x < a.length; x++) {
    flat[x] = a[x].id;
  }
  // Compare each ID and return the first of each
  var uniqueJobs = a.filter(function (elem, pos) {
    return flat.indexOf(elem.id) == pos;
  });
  return uniqueJobs;
}

// Twitter setup
var client = new _twitter2.default({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// Mongo Setup
var mongoURL = process.env.MONGO_URL;
var MongoClient = _mongodb2.default.MongoClient;

// Scrape!
var initScrape = undefined;
(initScrape = function () {
  var jobArray = [];
  // Scrape each task, append it into job array
  _async2.default.each(_scraperconfig.scraperConfig, function (task, taskDone) {
    // Scrape each task, tweet, then log
    var jobScraper = new _scraper2.default(task);
    jobScraper.scrape(function (jobs) {
      jobArray = jobArray.concat(jobs);
      taskDone();
    });
  }, function (err) {

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
        (function () {
          // Connected!
          console.log('Connection established to', mongoURL);
          var collection = db.collection('jobs');

          // Iterate through jobs
          _async2.default.each(jobs, function (job, callback) {
            collection.find({ id: job.id }).toArray(function (err, result) {
              if (err) {
                // Error
                console.log(err);
              } else if (result.length) {
                // Duplicate
                //console.log(job.title + " - is a duplicate, ignoring.");
                ignoredCount++;
                callback();
              } else {
                //New Job, tweet about it!
                var tweetString = "${job.title} - ${job.location}";
                console.log(tweetString);

                client.post('statuses/update', {
                  status: tweetString
                }, function (error, tweet, response) {
                  if (error) throw error;
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
          }, function (err) {
            // Job's done, post stats
            console.log("Total Jobs: " + jobsFilteredCount);
            console.log("Total Before Filter: " + jobTotalCount);
            console.log("Total Jobs Ignored: " + ignoredCount);

            console.log("Mission Accomplished");
            db.close();
          });
        })();
      }
    });
  });
})();

// Schedule every 6 minutes
var j = _nodeSchedule2.default.scheduleJob('*/1 * * * *', function () {
  initScrape();
});
