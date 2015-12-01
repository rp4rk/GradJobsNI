// Requirements
var xray = require('x-ray');
var x = xray();

// Whitelist and Blacklist
var whitelist = [
  "graduate", 
  "junior", 
  "apprentice",
  "apprenticeship", 
  "trainee", 
  "developer", 
  "tester", 
  "technician"
];

var blacklist = [
  "senior",
  "experienced",
  "london",
  "programme",
  "scheme",
  "glasgow",
  "manchester"
]

// Scrape Export
exports.job = function(config, callback) {
  
  x(config.url, config.rootSelector, [config.selectors])(function(err, result){
    if (!result) { result = [] }
    
    // Iterate through each scraped job
    var filteredResults = result.filter(function(job) {
      
      var isValidJob = false;
      
      // Filter our results
      whitelist.forEach(function(word) {
        if (job.title.toLowerCase().indexOf(word) > -1) {
          
          // Flag as a valid job
          isValidJob = true;
          
          // Job meets whitelist, but check for any blacklisted words too
          blacklist.forEach(function(badword) {
            if (job.title.toLowerCase().indexOf(badword) > -1) {
              isValidJob = false
            }
          })
          
        } 
      })

      
      // Approve or deny
      if (isValidJob) {
        // Check if we have any custom properties to derive
        if (config.customTransforms) {
          config.customTransforms.forEach(function(transform) {
            var result = transform(job.link);
            job[result.property] = result.value;
          })
        } 
        return job
      } else {
        //console.log(job.title + " is trash, ignoring.")
      }
      
    });
    
    callback(filteredResults);

  })
  .paginate(config.pagination)
  .limit(config.limit)
  
}