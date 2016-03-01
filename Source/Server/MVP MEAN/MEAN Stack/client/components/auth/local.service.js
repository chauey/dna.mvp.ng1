'use strict';

angular.module('angularFullstackApp')
  .factory('Local', function ($resource) {
      return $resource('/auth/local/:controller', {
          id: '@_id'
      },
      {
          verifyMail: {
              method: 'GET',
              params: {
                  controller: 'mailconfirmation'
              }
          },
          confirmMail: {
              method: 'POST',
              params: {
                  controller: 'mailconfirmation'
              }
          },
          sendResetMail: {
              method: 'GET',
              params: {
                  controller: 'passwordreset'
              }
          },
          verifyToken: {
              method: 'POST',
              params: {
                  controller: 'passwordreset'
              }
          },
          submitPasword: {
              method: 'GET',
              params: {
                  controller: 'resetpassword'
              }
          },
          setNewPassword: {
              method: 'POST',
              params: {
                  controller: 'resetpassword'
              }
          }
      });
  });