'use strict';

angular.module('angularFullstackApp')
  .controller('PwdResetCtrl', function ($scope, Auth, $stateParams, $location, $window) {

  var passwordResetToken = $stateParams.passwordResetToken;
  var pwdResetState = 'mailform';
  $scope.pwdResetMailSend = false;
  $scope.token = $stateParams.passwordResetToken;

  if (passwordResetToken) {
    console.log('CLIENT_CONTROLLER - In _if[passwordResetToken]');
    Auth.confirmResetedPassword(passwordResetToken)
      .then(function () {
      console.log('VALID_TOKEN');
      pwdResetState = 'valid_token';
    })
      .catch(function () {
      pwdResetState = 'invalid_token';
    });
  }

  // Send password reset mail
  $scope.sendPwdResetMail = function (form) {
    console.log('CLIENT_CONTROLLER - In sendPwdResetMail - client/app/pwdreset/pwdreset.controller.js')
    $scope.submitted = true;
    form.email.$setValidity('unknownMailAddress', true);
    if (form.$valid) {
      $scope.pwdResetMailSend = true;
      console.log('CLIENT_CONTROLLER - Before Auth.sendPwdResetMail');
      Auth.sendPwdResetMail($scope.reset.email)
        .then(function () {
        pwdResetState = 'mailsent';
      })
        .catch(function () {
        form.email.$setValidity('unknownMailAddress', false);
        $scope.pwdResetMailSend = false;
      });
    }
  };

  // Set new password
  $scope.submitNewPwd = function (submitForm, token) {
    console.log('CLIENT_CONTROLLER - In submitNewPwd - client/app/pwdreset/pwdreset.controller.js');
    debugger;
    $scope.submitted = true;
    if (submitForm.$valid) {
      console.log('CLIENT_CONTROLLER - Before Auth.setNewPassword');
      if (passwordResetToken) {
        console.log('GOT TOKEN');
        console.log($scope.reset.newPassword);
      }
      Auth.setNewPassword(passwordResetToken, $scope.reset.newPassword)
        .then(function () {
        pwdResetState = 'reseted';
        console.log('after Auth.setNewPassword - reseted!');
      })
        .catch(function () {
        $scope.pwdResetMailSend = false;
      });
    }
  };

  $scope.resetStateIs = function (state) {
    return pwdResetState === state;
  };
});
