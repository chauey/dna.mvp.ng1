'use strict';

angular.module('angularFullstackApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $window, $stateParams) {
    $scope.user = {};
    $scope.errors = {};

    if ($stateParams.sessionToken) {
      Auth.setSessionToken($stateParams.sessionToken, function(){$location.path('/');});
    }


    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
