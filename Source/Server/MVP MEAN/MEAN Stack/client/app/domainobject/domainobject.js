'use strict';

angular.module('angularFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('domainobject', {
        url: '/domainobject',
        templateUrl: 'app/domainobject/domainobject.html',
        controller: 'DomainobjectCtrl'
      });
  });