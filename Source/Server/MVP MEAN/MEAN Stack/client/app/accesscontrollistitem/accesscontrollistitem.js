'use strict';

angular.module('angularFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('accesscontrollistitem', {
        url: '/accesscontrollistitem',
        templateUrl: 'app/accesscontrollistitem/accesscontrollistitem.html',
        controller: 'AccesscontrollistitemCtrl'
      });
  });