'use strict';

angular.module('angularFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('title', {
        url: '/title',
        templateUrl: 'app/title/title.html',
        controller: 'TitleCtrl'
      });
  });