// Requirements
const schedule = require('node-schedule');
const scraperConfig = require('./config/scraperconfig');
const Scraper = require('./utils/scraper');
const MongoDB = require('./utils/mongodb');
const Twitter = require('./utils/twitter');


// Initialize instances of handlers
const GradJobDB = new MongoDB();
const Tweeter = new Twitter();


// Scrape and insert to Database
const initScrape = function scrapeAndPost() {
  scraperConfig.forEach(site => {
    const siteScraper = new Scraper(site);

    // Scrape the website
    siteScraper.scrape()
      .then((result) => {
        // Remove any dupes that exist already in our database
        GradJobDB.removeDupes(result, 'jobs').then((filteredJobs) => {
          // Only tweet out for production
          if (process.env.PRODUCTION === 'true') {
            filteredJobs.forEach(job => Tweeter.sendTweet(`${job.title} - ${job.location}`));
          } else {
            filteredJobs.forEach(job => console.log(`${job.title} - ${job.location}`));
            console.log(`Previous: ${result.length} - After: ${filteredJobs.length}`);
          }

          // Add the filtered jobs in
          GradJobDB.bulkInsert(filteredJobs, 'jobs');
        });
      });
  });
};
initScrape();

// Schedule every hour
schedule.scheduleJob('0 * * * *', () => { initScrape(); });
