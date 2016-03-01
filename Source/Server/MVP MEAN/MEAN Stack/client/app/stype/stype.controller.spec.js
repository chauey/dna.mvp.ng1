'use strict';

describe('Controller: StypeCtrl', function () {

  // load the controller's module
  beforeEach(module('yeomanDemoApp'));

  var StypeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    StypeCtrl = $controller('StypeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
