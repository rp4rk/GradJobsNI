'use strict';

export default angular.module('index.components', [
	require('./components/job-list/job-list.module').name,
	require('./components/job-list-item/job-list-item.module').name,
	require('./components/pagination/pagination.module').name,
]);
