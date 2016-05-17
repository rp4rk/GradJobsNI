'use strict';

import paginationDirective from './pagination.directive';
import './pagination.scss';

const paginationModule = angular.module('pagination-module', []);

paginationModule
  .directive('pagination', paginationDirective);

export default paginationModule;
