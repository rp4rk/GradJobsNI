'use strict';

import jobListTemplate from './job-list.html';

function jobListComponent($log) {
	'ngInject';

  var directive = {
    restrict: 'E',
    templateUrl: jobListTemplate,
    controller: ['jobsFactory', '$scope', jobListController],
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  function jobListController (jobsFactory, $scope) {
	  // Variables
		$scope.listDetails = {
			offset: 0, // Where to start listing from
			limit: 10, // How many items per page
			maxOffset: 0, // The maximum offset reached this session
		}

		// Initialize our job array
		$scope.jobs = {
			loaded: false,
			data: [],
		}

		// Load jobs into scope
		jobsFactory.getJobs($scope.listDetails.offset, $scope.listDetails.limit,
			success => {
				$scope.jobs.data = success.data;
				$scope.jobs.loaded = true; // We've loaded jobs!
				$log.debug($scope.jobs);
			},
			error => {
				console.log(error); // TODO: Error handle
			}
		);


  }

}

export default jobListComponent;
