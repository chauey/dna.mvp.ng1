'use strict';

describe('Controller: MstCtrl', function () {

  // load the controller's module
  beforeEach(module('angularFullstackApp'));

  var MstCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MstCtrl = $controller('MstCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
