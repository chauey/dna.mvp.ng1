'use strict';

describe('Controller: RoleCtrl', function () {

  // load the controller's module
  beforeEach(module('mvpMeanApp'));

  var RoleCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RoleCtrl = $controller('RoleCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
