'use strict';

angular.module('angularFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('alldatatype', {
        url: '/alldatatype',
        templateUrl: 'app/alldatatype/alldatatype.html',
        controller: 'AlldatatypeCtrl'
      });
  });