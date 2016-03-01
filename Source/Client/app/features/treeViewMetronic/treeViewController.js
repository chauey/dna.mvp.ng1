// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'TreeViewController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, TreeViewController);

    // 2. Inject dependencies
    TreeViewController.$inject = ['$rootScope', '$scope', 'settings', '$http', '$timeout',
        'common', 'datacontext'];

    // #region 3. Define controller
    function TreeViewController($rootScope, $scope, settings, $http, $timeout,
        common, datacontext) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            Metronic.initAjax();

            // set default layout mode
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
        });

    }
    // #endregion

})();