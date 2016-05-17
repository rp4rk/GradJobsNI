'use strict';

export default function (app) {
  app
    .factory('jobsFactory', jobsFactory);

  function jobsFactory ($http, API) {

    // Methods to expose
    const jobsMethods = {
      // Get jobs with an offset and limit
      getJobs:
        (offset, limit, resolve, reject) => {
          $http({
            method: 'GET',
            url: `http://${API.url}:${API.port}/api/jobs?limit=${limit}&offset=${offset}`
          })
            .then(
              success => resolve(success.data),
              error => resolve(error)
            )
        },
      // Get a specific job
      getJob:
        (resolve, reject) => {
          return;
        },
    };



      return jobsMethods
    }
}
