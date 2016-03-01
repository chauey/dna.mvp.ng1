'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: process.env.SESSION_SECRET || 'angular-fullstack-secret',
    mailConfirmation : process.env.MAIL_CONFIRMATION_SECRET || 'mailConfirmation',
    passwordReset: process.env.PASSWORD_RESET_SECRET || 'passwordReset'
  },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  mail: { //transport: process.env.MAIL_TRANSPORT_METHOD || 'mail_transport',
    service: process.env.MAIL_SERVICE || 'mail_service', 
    auth: {
      user: process.env.MAIL_USER || 'mail_user',
      pass: process.env.MAIL_PASS || 'mail_pass'
    },
    from : {
      name : process.env.MAIL_FROM_NAME || 'mail_from_name',
        address : process.env.MAIL_FROM_ADDRESS || 'mail_from_address'
    }
  },

  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});