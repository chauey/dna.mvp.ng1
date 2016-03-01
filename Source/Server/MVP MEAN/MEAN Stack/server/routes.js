/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/msts', require('./api/mst'));
  app.use('/api/alldatatypes', require('./api/alldatatype'));
  app.use('/api/domainobjects', require('./api/domainobject'));
  app.use('/api/accesscontrollistitems', require('./api/accesscontrollistitem'));
  app.use('/api/validations', require('./api/validation'));
  app.use('/api/titles', require('./api/title'));
  app.use('/api/permissions', require('./api/permission'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
