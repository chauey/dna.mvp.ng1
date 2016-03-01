'use strict';

angular.module('angularFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mst', {
        url: '/mst',
        templateUrl: 'app/mst/mst.html',
        controller: 'MstCtrl'
      });
  });