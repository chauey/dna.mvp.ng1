// 0. IIFE (Immediately-invoked function expression)
(function () {
/**
 * @description
 * 
 * Controller for work in progress (WIP) view
 * - Get wip list and all wip items.
 * - Cancel wip.
 * - Go to wip item.
 */

    'use strict';

    var controllerId = 'WipController';

    // 1. Get 'app' module and define controller
    angular.module('app.features').controller(controllerId, WipController);

    // 2. Inject dependencies
    WipController.$inject = ['$scope', '$location',
            'bootstrap.dialog', 'common', 'config', 'datacontext'];

    // #region 3. Define controller
    function WipController($scope, $location,
        bsDialog, common, config, datacontext) {
        // 3.1. Define functions
        var vm = this;

        // #region 3.2. Define bindable variables to the view
        vm.cancelAllWip = cancelAllWip;
        vm.gotoWip = gotoWip;
        vm.predicate = '';
        vm.reverse = false;
        vm.setSort = setSort;
        vm.title = 'Work in Progress';
        vm.wip = [];
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController([getWipSummary()], controllerId);

            $scope.$on(config.events.storage.wipChanged, function (event, data) {
                vm.wip = data;
            });
        }

        function getWipSummary() {
            vm.wip = datacontext.zStorageWip.getWipSummary();
        }

        function cancelAllWip() {
            vm.isDeleting = true;

            return bsDialog.deleteDialog('Work in Progress')
                .then(confirmDelete, cancelDelete);

            function cancelDelete() { vm.isDeleting = false; }

            function confirmDelete() {
                datacontext.zStorageWip.clearAllWip();
                vm.isDeleting = false;
            }
        }

        function setSort(prop) {
            vm.predicate = prop;

            vm.reverse = !vm.reverse;
        }

        function gotoWip(wipData) {
            var entityName = wipData.entityName;
            entityName = entityName.charAt(0).toLowerCase() + entityName.slice(1);
            $location.path('/' + entityName + '/' + wipData.key);
        }
        // #endregion
    }
    // #endregion
})();