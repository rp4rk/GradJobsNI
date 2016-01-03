// Requirements
import async from 'async';
import env from 'node-env-file';
import mongodb from 'mongodb';
import Twitter from 'twitter';
import schedule from 'node-schedule';
import scraper from './scraper';
import { scraperConfig } from './scraperconfig';

// Environment vars
env(__dirname + '/../config/config.env');

// Array Filter - Remove duplicate jobs
function uniq(a) {
  // Create a flat array with our IDs
  let flat = [];
  for (let x=0; x<a.length; x++) {
    flat[x] = a[x].id;
  }
  // Compare each ID and return the first of each
  let uniqueJobs = a.filter((elem, pos) => {
    return flat.indexOf(elem.id) == pos;
  });
  return uniqueJobs;
}

// Twitter setup
const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Mongo Setup
const mongoURL = process.env.MONGO_URL;
const MongoClient = mongodb.MongoClient;

// Scrape!
let initScrape;
(initScrape = function() {
  let jobArray = [];
  // Scrape each task, append it into job array
  async.each(scraperConfig, (task, taskDone) => {
    // Scrape each task, tweet, then log
    let jobScraper = new scraper(task);
    jobScraper.scrape(jobs => {
      jobArray = jobArray.concat(jobs);
      taskDone();
    });
  }, err => {

    // Filter out duplicates
    let jobs = uniq(jobArray);
    let jobTotalCount = jobArray.length;
    let jobsFilteredCount = jobs.length;
    let ignoredCount = 0;

    // Add to MongoDB
    MongoClient.connect(mongoURL, (err, db) => {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        // Connected!
        console.log('Connection established to', mongoURL);
        let collection = db.collection('jobs');

        // Iterate through jobs
        async.each(jobs, (job, callback) => {
          collection.find({id: job.id}).toArray((err, result) => {
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
              },
              (error, tweet, response) => {
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
        }, err => {
          // Job's done, post stats
          console.log("Total Jobs: " + jobsFilteredCount);
          console.log("Total Before Filter: " + jobTotalCount);
          console.log("Total Jobs Ignored: " + ignoredCount);

          console.log("Mission Accomplished");
          db.close();
        });
      }
    });

  });


})()

// Schedule every 6 minutes
let j = schedule.scheduleJob('*/1 * * * *', () => { initScrape() });
