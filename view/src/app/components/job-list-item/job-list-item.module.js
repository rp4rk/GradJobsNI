'use strict';

import jobListItemDirective from './job-list-item.directive';
import './job-list-item.scss';

const jobListItemModule = angular.module('job-list-item-module', []);

jobListItemModule
  .directive('jobListItem', jobListItemDirective);

export default jobListItemModule;
