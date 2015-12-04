// Requirements
import async from 'async';
import env from 'node-env-file';
import mongodb from 'mongodb';
import Twitter from 'twitter';
import schedule from 'node-schedule';

import scrape from './scrape.js';

// Environment vars
env('./config/config.env');

// Array Filter - Remove duplicate jobs
function uniq(a) {
  // Create a flat array with our IDs
  let flat = [];
  for (let x=0; x<a.length; x++) {
    flat[x] = a[x].id;
  };
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

// Configure what we want to scrape
const scrapeTasks = [
  {
    url : 'http://www.nijobfinder.co.uk/search/262329691/Page1/',
    rootSelector : '.result',
    selectors : {
      title: '.job-title a',
      image: '.recruiter-logo@src',
      location: '.job-title a@href'
    },
    pagination: '.next a@href',
    limit: 10,
    customTransforms : [
      url => {
        let id = url.match(/\/\d{6}\//g)[0].replace('/', '');
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
      location: '.job-title a@href'
      },
    pagination: '.next a@href',
    limit: 10,
    customTransforms : [
      url => {
        let id = url.match(/\/\d{6}\//g)[0].replace('/', '');
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
      location: '.turnstileLink@href',
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
      location: '.turnstileLink@href',
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
      location: '.job-result-title h2 a@href',
    },
    pagination: '#pagination li:last-child a@href',
    limit: 6,
    customTransforms : [
      url => {
        let id = url.match(/\d{7}/g)[0];
        return {
          property: 'id',
          value: id
        }
      }
    ]
  },
];


// Scrape!
let initScrape;
(initScrape = function() {

  let jobArray = [];

  // Scrape each task, append it into job array
  async.each(scrapeTasks, (task, taskDone) => {
    // Scrape each task, tweet, then log
    scrape.job(task, jobs => {
      jobArray = jobArray.concat(jobs)
      taskDone();
    })
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
              var tweetString = job.title + " - " + job.location;
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
        })
      }
    });

  })


}
)()

// Schedule every 6 minutes
let j = schedule.scheduleJob('*/1 * * * *', () => { initScrape() });
