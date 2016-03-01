'use strict';

describe('Controller: PermissionCtrl', function () {

  // load the controller's module
  beforeEach(module('angularFullstackApp'));

  var PermissionCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PermissionCtrl = $controller('PermissionCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
