var testSite = {
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
        val: id
      }
    }
  ]
};

export default testSite
