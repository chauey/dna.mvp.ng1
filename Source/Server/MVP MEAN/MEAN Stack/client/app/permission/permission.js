'use strict';

angular.module('angularFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('permission', {
        url: '/permission',
        templateUrl: 'app/permission/permission.html',
        controller: 'PermissionCtrl'
      });
  });