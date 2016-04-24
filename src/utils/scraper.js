// Requirements
const xray = require('x-ray');
const wordList = require('../config/words.js');
const x = xray();

// Scrape Export
module.exports = class Scraper {
  constructor(config) {
    this.url = config.url;
    this.rootSelector = config.rootSelector;
    this.selectors = [config.selectors];
    this.pagination = config.pagination;
    this.limit = config.limit;
    this.customTransforms = config.customTransforms || [];
  }

  // Filters jobs through the whitelist and blacklist
  jobfilter(joblist) {
    if (joblist) {
      return joblist.filter(job => {
        let isValidJob = false;

        // Check through the whitelist
        wordList.whitelist.forEach(word => {
          if (job.title.toLowerCase().indexOf(word) > -1) {
            isValidJob = true;

            // Check through the blacklist to ensure nothing filters by
            wordList.blacklist.forEach(badword => {
              if (job.title.toLowerCase().indexOf(badword) > -1) {
                isValidJob = false;
              }
            });
          }
        });

        // Return any word that has a whitelisted word, but no blacklisted word
        return isValidJob;
      });
    } else {
      console.log(joblist);
    }
  }


  // Apply any transforms, including removing Indeed ads (they're broken!)
  applyTransforms(joblist) {
    return joblist.map(job => {
      const jobTransform = job;

      // Run through our transforms
      if (this.customTransforms.length > 0) {
        this.customTransforms.forEach(transform => {
          const result = transform(jobTransform.location);
          jobTransform[result.property] = result.value;
        });
      }

      // Return the transformed job
      return jobTransform;
    })
    .filter(job => job.location.indexOf('pagead') < 0);
  }

  // Filter the array, return array of unique jobs
  returnUniqueJobs(joblist) {
    // Create a flat array of IDs
    const idList = joblist.map((job) => job.id);

    // Filter the original array based on whether or not the id
    // is at the first location (returned by indexOf) or not.
    return joblist.filter((elem, pos) => idList.indexOf(elem.id) === pos);
  }


  // Scrape the results and return a promise
  scrape() {
    return new Promise((resolve, reject) => {
      x(this.url, this.rootSelector, this.selectors)((err, result) => {
        if (err) { reject(err); }
        if (!result) { reject('No results available.'); }

        // Resolve the promise with a filtered and transformed set of jobs
        resolve(this.returnUniqueJobs(this.applyTransforms(this.jobfilter(result))));
      })
        .paginate(this.pagination)
        .limit(this.limit);
    });
  }
};
