'use strict';

export default function (app) {
  app
    .constant('ROUTE_ERRORS', {
      auth: 'Authorization has been denied.',
    })
    .constant('API', {
      url: '192.168.99.100',
      port: '3000',
    });
}
