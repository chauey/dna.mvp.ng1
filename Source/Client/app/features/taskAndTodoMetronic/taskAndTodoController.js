// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'TaskAndTodoController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, TaskAndTodoController);

    // 2. Inject dependencies
    TaskAndTodoController.$inject = ['$rootScope', '$scope', '$http', '$timeout',
        'common', 'datacontext'];

    // #region 3. Define controller
    function TaskAndTodoController($rootScope, $scope, $http, $timeout,
        common, datacontext) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            Metronic.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    }
    // #endregion

})();