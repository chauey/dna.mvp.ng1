// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'DashboardMetronicController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, DashboardMetronicController);

    // 2. Inject dependencies
    DashboardMetronicController.$inject = ['$rootScope', '$scope', '$http', '$timeout',
        'common', 'datacontext'];

    // #region 3. Define controller
    function DashboardMetronicController($rootScope, $scope, $http, $timeout,
        common, datacontext) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            Metronic.initAjax();
        });

        // set sidebar closed and body solid layout mode
        //$rootScope.settings.layout.pageBodySolid = true;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    }
    // #endregion

})();