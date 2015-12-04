// Requirements
import xray from 'x-ray';
import { whitelist, blacklist } from './words.js';
const x = xray();

// Scrape Export
class Scraper {
  constructor(config) {
    this.url = config.url;
    this.rootSelector = config.rootSelector;
    this.selectors = [config.selectors];
    this.pagination = config.pagination;
    this.limit = config.limit;
    this.customTransforms = config.customTransforms || [];
  }

  jobfilter(joblist) {
    return joblist.filter(job => {
      let isValidJob = false;
      whitelist.forEach(word => {
        if (job.title.toLowerCase().indexOf(word) > -1) {
          isValidJob = true;
          blacklist.forEach(badword => {
            if (job.title.toLowerCase().indexOf(badword) > -1) {
              isValidJob = false
            };
          });
        };
      });
      return isValidJob;
    });
  }

  applyTransforms(joblist) {
    return joblist.map(job => {
      this.customTransforms.forEach(transform => {
        let result = transform(job.location);
        job[result.property] = result.val;
      });
      return job
    });
  }

  scrape(callback) {
    let jobsList = [];
    x(this.url, this.rootSelector, this.selectors)((err, result) => {
      if (!result) { result = [] };
      if (err) { console.error(err) };

      let jobsList = this.applyTransforms(this.jobfilter(result));
      callback(jobsList);
    })
    .paginate(this.pagination)
    .limit(this.limit);
  }
}

export default Scraper;
