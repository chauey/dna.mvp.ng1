'use strict';

angular.module('yeomanDemoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('stype', {
        url: '/stype',
        templateUrl: 'app/stype/stype.html',
        controller: 'StypeCtrl'
      })
      .state('newSchematype', {
          url: '/newType',
          templateUrl: 'app/stype/create.html',
          controller: 'StypeCtrl'
      });
  });