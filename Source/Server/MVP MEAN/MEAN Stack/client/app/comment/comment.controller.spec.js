'use strict';

describe('Controller: CommentCtrl', function () {

  // load the controller's module
  beforeEach(module('yeomanDemoApp'));

  var CommentCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CommentCtrl = $controller('CommentCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
