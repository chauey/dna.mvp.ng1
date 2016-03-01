'use strict';

angular.module('angularFullstackApp')
  .controller('ConfirmCtrl', function ($scope, Auth, $location, $stateParams) {
    $scope.errors = {};
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.confirmToken = $stateParams.confirmToken;
    var confirmationMailSend = false;
    $scope.invalidToken = false;

  
    if ($scope.confirmToken) {
      Auth.confirmMail($scope.confirmToken)
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function() {
          $scope.invalidToken = true;
        });
    }


    $scope.sendConfirmationMail = function() {

      if(Auth.isLoggedIn()) {
        confirmationMailSend = true;
        Auth.sendConfirmationMail(function(){
          confirmationMailSend = false;
        });
      }
    };

    $scope.confirmationMailSend = function() {
      return confirmationMailSend;
    };


  });
