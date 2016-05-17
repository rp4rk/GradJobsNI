'use strict';

import jobListItemTemplate from './job-list-item.html';

function jobListItemComponent($log) {
	'ngInject';

  var directive = {
    restrict: 'E',
    templateUrl: jobListItemTemplate,
    controller: jobListItemController,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  function jobListItemController () {
	  
  }

}

export default jobListItemComponent;
