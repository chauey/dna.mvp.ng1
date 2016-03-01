'use strict';

angular.module('angularFullstackApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }, {
      'title': 'ACL',
      'link': '/accesscontrollistitem'
    }, {
      'title': 'Domain Objects',
      'link': '/domainobject'
    }, {
      'title': 'Roles',
      'link': '/title'
    }, {
      'title': 'Permissons',
      'link': '/permission'
    }, {
      'title': 'Data Types',
      'link': '/alldatatype'
    }, {
      'title': 'Validations',
      'link': '/validation'
    }, {
      'title': 'Mongoose',
      'link': '/mst'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.isMailconfirmed = Auth.isMailconfirmed;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });