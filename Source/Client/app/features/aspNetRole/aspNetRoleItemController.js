// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'aspNetRoleItemController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, AspNetRoleItemController);

    // 2. Inject dependencies
    AspNetRoleItemController.$inject = ['$location', '$stateParams', '$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
    // #region 3. Define controller
    function AspNetRoleItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

        // #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.aspNetRole;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.aspNetRole = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalAspNetRole = null;


        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteAspNetRole = deleteAspNetRole;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        // For DateTime fields


        // For modal dialog
        vm.isModal = false;
        if ($scope.isModal) {
            vm.isModal = $scope.isModal;
        }
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([getRequestedAspNetRole()], controllerId)
    .then();
        }

        function getRequestedAspNetRole() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log

                return vm.aspNetRole = datacontext.aspNetRole.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.isCreating = true;
                vm.actionType = 'I'; // For audit log

                return vm.aspNetRole = datacontext.aspNetRole.create();
            }

            return datacontext.aspNetRole.getById(val)
                .then(function (data) {
                    data = data.data;
                    vm.actionType = 'U'; // For audit log
                    vm.aspNetRole = data.entity || data;
                }, function (error) {
                    logError('Unable to get AspNetRole ' + val);
                    goBackToList();
                });
        }

        //#region Back - Save - Cancel - Delete
        function goBack() {
            if (!vm.isModal) {
                $window.history.back();
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goBackToList() {
            $location.path('/roleList');
        }

        function cancel() {
            datacontext.cancel();
            if (!vm.isModal) {
                urlHelper.replaceLocationUrlGuidWithId(vm.aspNetRole.id);
                if (vm.aspNetRole.entityAspect.entityState.isDetached()) {
                    goToAspNetRoles();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goToAspNetRoles() {
            $location.path('/aspNetRoles');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                datacontext.cancel();
            });
        }

        function canSave() {
            return (vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;

            // Save Changes
            if (vm.isCreating) {
                return datacontext.aspNetRole.post(vm.aspNetRole)
                    .then(function (saveResult) {
                        vm.isSaving = false;
                        goBackToList();
                    }, function (error) {
                        vm.isSaving = false;
                    });
            } else {
                return datacontext.aspNetRole.put(vm.aspNetRole.id, vm.aspNetRole)
                    .then(function (saveResult) {
                        vm.isSaving = false;
                        goBackToList();

                    }, function (error) {
                        vm.isSaving = false;
                    });

            }
        }

        function onHasChanges() {
            //$scope.$on(config.events.hasChangesChanged,
            //    function (event, data) {
            //        vm.hasChanges = true;
            //    });
            return vm.hasChanges = true;
        }

        function deleteAspNetRole() {
            return bsDialog.deleteDialog('AspNetRole')
                .then(confirmDelete);

            function confirmDelete() {
                return datacontext.aspNetRole.delete(vm.aspNetRole.id)
                   .then(function (saveResult) {
                       goBackToList();

                   }, function (error) {
                       vm.isSaving = false;
                   });
            }
        }
        //#endregion

        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;
        }

        function cloneAspNetRole(aspNetRole) {
            return {
                Id: aspNetRole.id,
                Name: aspNetRole.name,
            };
        }
        // #endregion
    }
    // #endregion
})();

