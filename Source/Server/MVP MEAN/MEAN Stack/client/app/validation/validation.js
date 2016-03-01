'use strict';

angular.module('angularFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('validation', {
        url: '/validation',
        templateUrl: 'app/validation/validation.html',
        controller: 'ValidationCtrl'
      });
  });