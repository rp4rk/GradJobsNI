'use strict';

import paginationTemplate from './pagination.html';

function paginationComponent($log) {
	'ngInject';

  var directive = {
    restrict: 'E',
    templateUrl: paginationTemplate,
    controller: ['$scope', 'jobsFactory', paginationController],
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  function paginationController ($scope, jobsFactory) {
	  $log.debug('Hello from pagination controller!');
		$log.debug($scope)

		// Add more jobs
		$scope.goForwards = function goForwards() {
			let l = $scope.listDetails; // Brevity and whatnot
			let j = $scope.jobs;
			let newOffset = l.offset + l.limit; // The offset we need
			let limit = l.limit; // The limit

			// Go to next
			if (j.data.length > newOffset) {
				$log.debug("We have the jobs");
				$scope.listDetails.offset = newOffset;
			} else if (j.data.length <= newOffset) {
				$log.debug("We have to fetch new jobs");
				jobsFactory.getJobs(newOffset, limit,
					success => {
						$scope.jobs.data = $scope.jobs.data.concat(success.data);
						if (success.data.length > 0)
							$scope.listDetails.offset = newOffset; // Move our offset
						$log.debug($scope);
					},
					error => {
						$log.debug(error);
					}
				);
			}
		}

		// Go back by 1 limit
		$scope.goBack = function goBack() {
			let newOffset = $scope.listDetails.offset - $scope.listDetails.limit;

			// Only go back if we don't go past the beginning
			if (newOffset >= 0) {
				$scope.listDetails.offset = newOffset;
			}
		}
  }

}

export default paginationComponent;
