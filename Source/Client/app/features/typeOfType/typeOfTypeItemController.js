// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'TypeOfTypeItemController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, TypeOfTypeItemController);

    // 2. Inject dependencies
    TypeOfTypeItemController.$inject = ['$location', '$stateParams', '$scope', '$window',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'model', 'datacontext', 'urlHelper'];

    // #region 3. Define controller
    function TypeOfTypeItemController($location, $stateParams, $scope, $window,
        bsDialog, common, config, commonConfig, model, datacontext, urlHelper) {
        // #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.typeOfType;
        var wipEntityKey = undefined;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.typeOfType = undefined;

        vm.selectedParent = undefined;
        vm.selectedType = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalTypeOfType = null;

        vm.parent = [];
        vm.types = [];

        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteTypeOfType = deleteTypeOfType;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
            initLookups();
            common.activateController([getRequestedTypeOfType()], controllerId)
                .then(onEveryChange());
        }

        function getRequestedTypeOfType() {
            var val = $stateParams.id;

            if (val === 'new') {
                vm.actionType = 'I'; // For audit log

                // get brand-new entity from server...
                val = common.emptyGuid;
            }

            datacontext.typeOfType.getById(val)
               .then(function (response) {
                   vm.actionType = 'U'; // For audit log
                   vm.typeOfType = response.data;
               }, function (error) {
                   logError('Unable to get Type Of Type ' + val);
                   goToTypeOfTypes();
               });
        }

        //#region Back - Save - Cancel - Delete
        function goBack() { $window.history.back(); }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            urlHelper.replaceLocationUrlGuidWithId(vm.typeOfType.typeOfTypeID);
            if (vm.typeOfType.entityAspect.entityState.isDetached()) {
                goToTypeOfTypes();
            }
        }

        function goToTypeOfTypes() {
            $location.path('/typeOfTypeList');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }

        function canSave() {
            return (!vm.isSaving);
        }

        function save() {
            vm.isSaving = true;

            var val = $stateParams.id;
            if (val === 'new') {
                datacontext.typeOfType.save(vm.typeOfType, true).then(function (response) {
                    goToTypeOfTypes();
                }, function (error) {
                    // TODO: log this
                    vm.isSaving = false;
                });
            } else {
                datacontext.typeOfType.save(vm.typeOfType, false).then(function (response) {
                    // TODO: successfully, broadcast
                    goToTypeOfTypes();
                }, function (error) {
                    // TODO: log this
                    vm.isSaving = false;
                });
            }

            // Save Changes
            //return datacontext.save("SaveTypeOfTypes")
            //    .then(function (saveResult) {
            //        vm.isSaving = false;

            //        // Save Audit Log
            //        common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.typeOfType,
            //                            vm.actionType != 'D' ? vm.originalTypeOfType : cloneTypeOfType(vm.typeOfType),
            //                            vm.actionType != 'D' ? cloneTypeOfType(vm.typeOfType) : null);

            //        removeWipEntity();
            //        urlHelper.replaceLocationUrlGuidWithId(vm.typeOfType.typeOfTypeID);
            //    }, function (error) {
            //        vm.isSaving = false;
            //    });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function deleteTypeOfType() {
            return bsDialog.deleteDialog('Type Of Type')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                datacontext.typeOfType.remove(vm.typeOfType.typeOfTypeID).then(success).catch(failed);

                function success() {
                    //removeWipEntity();
                    goToTypeOfTypes();
                }

                function failed(error) { cancel(); }
            }
        }
        //#endregion

        function initLookups() {
            // get all types
            var query = "$orderby=name";
            datacontext.typeOfType.getAllWithoutPaging(query).then(function(response) {
                vm.types = response.data.value;
            });

            // get all parent types
            query += "&$filter=parentID eq null or parentID eq " + common.emptyGuid;
            datacontext.typeOfType.getAllWithoutPaging(query).then(function(response) {
                vm.parent = response.data.value;
            });
        }

        //#region Work in progress
        function storeWipEntity() {
            if (!vm.typeOfType) { return; }
            var description = vm.typeOfType.name || '[New TypeOfType] id: ' + vm.typeOfType.typeOfTypeID;

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.typeOfType, wipEntityKey, entityName, description);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) {
                    // TODO: save to WIP
                }
            );
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }
        //#endregion

        function clone(original) {
            return {
                TypeOfTypeID: original.typeOfTypeID,
                Abbreviation: original.abbreviation,
                Name: original.name,
                Key: original.key,
                Order: original.order,
                ParentID: original.parentID,
                TypeID: original.typeID
            };
        }
        // #endregion
    }
    // #endregion
})();