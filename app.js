var Xray = require('x-ray');
var x = Xray();

var niJobFinderGrads =    'http://www.nijobfinder.co.uk/search/262329691/Page1/';
var niJobFinderJuniors =  'http://www.nijobfinder.co.uk/search/262330730/Page1/';

var indeedGrads =   'http://www.indeed.co.uk/graduate-jobs-in-Northern-Ireland';
var indeedJuniors = 'http://www.indeed.co.uk/junior-jobs-in-Northern-Ireland';

var jobsArray = [];


x(niJobFinderGrads, '.result', [{
  title: '.job-title a',
  image: '.recruiter-logo@src',
  link: '.job-title a@href'
}])(function(err, result){
    jobsArray.push(result);
  })
  .paginate('.next a@href')
  .paginate(niJobFinderJuniors)
  .paginate('.next a@href')



x(indeedGrads, '.result', [{
  title: '.jobtitle@title',
  link: '.jobtitle@href'
}])(function(err, result){
    jobsArray.push(result);
  })
  .paginate('.pagination a:last-child@href')
  .limit(15)
  .write('indeed.json')

x(indeedGrads, '.result', [{
  title: '.jobtitle@title',
  link: '.jobtitle@href'
}])(function(err, result){
    jobsArray.push(result);
  })
  .paginate('.pagination a:last-child@href')
  .limit(15)
  .write('indeed-juniors.json')


