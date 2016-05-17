'use strict';

import * as components from './index.components';
import config from './index.config';
import run from './index.run';


const App = angular.module(
  "NIGradJobsView", [
    // plugins
    require('angular-ui-router'),
    "ngTouch",

    // core
    require("./core/core.module").name,

    // components
    require("./index.components").name,

    // routes
    require("./index.routes").name,

    // pages
    require("./pages/main/main.module").name

  ]
);

App
  .config(config)
  .run(run);



export default App;
