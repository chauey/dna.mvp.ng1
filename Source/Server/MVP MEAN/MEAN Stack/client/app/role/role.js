'use strict';

angular.module('mvpMeanApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('role', {
        url: '/role',
        templateUrl: 'app/role/role.html',
        controller: 'RoleCtrl'
      });
  });