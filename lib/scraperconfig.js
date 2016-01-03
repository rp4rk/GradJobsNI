export const scraperConfig = [
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
        };
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
        };
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
        };
      }
    ]
  },
];
