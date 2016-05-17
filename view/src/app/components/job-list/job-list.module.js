'use strict';

import jobListDirective from './job-list.directive';
import './job-list.scss';

const jobListModule = angular.module('job-list-module', []);

jobListModule
  .directive('jobList', jobListDirective);

export default jobListModule;
