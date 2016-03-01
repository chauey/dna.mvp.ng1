// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'AllDataTypeItemController';

    // 1. Add controller to module
    angular
		.module('app.features')
		.controller(controllerId, AllDataTypeItemController);

    // 2. Inject dependencies
    AllDataTypeItemController.$inject = ['$location', '$stateParams', '$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
    // 3. Define controller
    function AllDataTypeItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

        // #region 3.1. Setup variables and functions
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.allDataType;
        var wipEntityKey = undefined;
        // #endregion

        // #region 3.2. Expose public bindable interface
        vm.activate = activate;
        vm.allDataType = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalAllDataType = null;

        vm.zHierarchys = [];
        vm.selectedZHierarchy = null;
        $scope.$watch('vm.selectedZHierarchy', function (newValue, oldValue) {
            if (newValue === oldValue) return;
            vm.hasChanges = true;
        });

        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteAllDataType = deleteAllDataType;
        vm.hasChanges = false;
        vm.isSaving = false;
        vm.isCreating = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        // For DateTime fields

        vm.datePickerConfig = datePickerConfig;

        // For modal dialog
        vm.isModal = false;
        if ($scope.isModal) {
            vm.isModal = $scope.isModal;
        }
        vm.addZHierarchy = addZHierarchy;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Implement private functions
        function activate() {
            onDestroy();
            onHasChanges();
            initLookups();
            common.activateController([getRequestedAllDataType()], controllerId)
    .then(onEveryChange());
        }

        function getRequestedAllDataType() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.allDataType = datacontext.allDataType.create();
            }
            
            var val = $stateParams.id;

            if (val === 'new') {
                vm.isCreating = true;
                vm.actionType = 'I'; // For audit log
                return vm.allDataType = datacontext.allDataType.create();
            }

            return datacontext.allDataType.getById(val)
			    .then(function (data) {
			        data = data.data;
			        vm.actionType = 'U'; // For audit log
			        vm.originalAllDataType = cloneAllDataType(data);

			        // If get data from WIP, need to use data.entity, otherwise use data.
			        wipEntityKey = data.key;
			        vm.allDataType = data.entity || data;
			    }, function (error) {
			        logError('Unable to get AllDataType ' + val);
			        goToAllDataTypes();
			    });
        }

        // #region Back - Save - Cancel - Delete
        function goBack() {
            if (!vm.isModal) {
                $window.history.back();
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            if (!vm.isModal) {
                urlHelper.replaceLocationUrlGuidWithId(vm.allDataType.id);
                if (vm.allDataType.entityAspect.entityState.isDetached()) {
                    goToAllDataTypes();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goToAllDataTypes() {
            $location.path('/allDataTypes');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }

        function canSave() {
            // return (vm.hasChanges && !vm.isSaving);
            return true;
        }

        function save() {
            vm.isSaving = true;
            vm.allDataType.zHierarchyID = vm.selectedZHierarchy;
            vm.allDataType.bigInt = parseInt(vm.allDataType.bigInt);
            //vm.allDataType. = new Date(vm.allDataType.bigInt);
            //vm.allDataType. = new 

            // Save Changes
            if (vm.isCreating) {
                return datacontext.allDataType.post(vm.allDataType)
                    .then(function (saveResult) {
                        vm.isSaving = false;

                        // Save Audit Log
                        common.$broadcast(commonConfig.config.allDataTypeActionAddedEvent, vm.actionType, model.controllerNames.allDataType,
                                            vm.actionType != 'D' ? vm.originalAllDataType : cloneAllDataType(vm.allDataType),
                                            vm.actionType != 'D' ? cloneAllDataType(vm.allDataType) : null);

                        removeWipEntity();
                        if (!vm.isModal) {
                            urlHelper.replaceLocationUrlGuidWithId(vm.allDataType.id);
                        }
                        else {
                            $scope.modalInstance.close(vm.hospital);
                        }
                    }, function (error) {
                        vm.isSaving = false;
                    });
            } else {
                return datacontext.allDataType.put(vm.allDataType.id, vm.allDataType)
                   .then(function (saveResult) {
                       vm.isSaving = false;

                       // Save Audit Log
                       common.$broadcast(commonConfig.config.allDataTypeActionAddedEvent, vm.actionType, model.controllerNames.allDataType,
                           vm.actionType != 'D' ? vm.originalAllDataType : cloneAllDataType(vm.allDataType),
                           vm.actionType != 'D' ? cloneAllDataType(vm.allDataType) : null);

                       removeWipEntity();
                       if (!vm.isModal) {
                           urlHelper.replaceLocationUrlGuidWithId(vm.allDataType.id);
                       } else {
                           $scope.modalInstance.close(vm.hospital);
                       }
                   }, function (error) {
                       vm.isSaving = false;
                   });
            }
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function deleteAllDataType() {
            return bsDialog.deleteDialog('AllDataType')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                datacontext.markDeleted(vm.allDataType);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                    if (!vm.isModal) {
                        goToAllDataTypes();
                    }
                    else {
                        $scope.modalInstance.dismiss('cancel');
                    }
                }

                function failed(error) { cancel(); }
            }
        }
        // #endregion

        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;
            vm.zHierarchys = lookups.zHierarchys;
            if (vm.allDataType !== undefined) {
                vm.selectedZHierarchy = vm.allDataType.zHierarchyID;
            }

        }

        // #region Work in progress
        function storeWipEntity() {
            if (!vm.allDataType) { return; }
            var description = vm.allDataType.name || '[New AllDataType] id: ' + vm.allDataType.id; // Need to change "name" to a main property that we want to show to allDataType

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.allDataType, wipEntityKey, entityName, description);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) { autoStoreWip(); }
            );
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }
        // #endregion

        function cloneAllDataType(allDataType) {
            return {
                Id: allDataType.id,
                BigInt: allDataType.bigInt,
                Binary: allDataType.binary,
                Bit: allDataType.bit,
                Char: allDataType.char,
                Date: allDataType.date,
                DateTime: allDataType.dateTime,
                DateTime2: allDataType.dateTime2,
                DateTimeOffset: allDataType.dateTimeOffset,
                Decimal: allDataType.decimal,
                Float: allDataType.float,
                Geography: allDataType.geography,
                Geometry: allDataType.geometry,
                Image: allDataType.image,
                Int: allDataType.int,
                Money: allDataType.money,
                NChar: allDataType.nChar,
                NText: allDataType.nText,
                Numeric: allDataType.numeric,
                NVarChar: allDataType.nVarChar,
                NVarCharMax: allDataType.nVarCharMax,
                Real: allDataType.real,
                SmallDateTime: allDataType.smallDateTime,
                SmallInt: allDataType.smallInt,
                SmallMoney: allDataType.smallMoney,
                Text: allDataType.text,
                Time: allDataType.time,
                TimeStamp: allDataType.timeStamp,
                TinyInt: allDataType.tinyInt,
                UniqueIdentifier: allDataType.uniqueIdentifier,
                VarBinary: allDataType.varBinary,
                VarBinaryMax: allDataType.varBinaryMax,
                VarChar: allDataType.varChar,
                VarCharMax: allDataType.varCharMax,
                Xml: allDataType.xml,
                ZHierarchyID: allDataType.zHierarchyID,
                ZSql_Variant: allDataType.zSql_Variant,
            };
        }
        // #endregion
        // #region Modal Dialog
        function addZHierarchy() {
            var modalScope = $rootScope.$new();
            // passing parameter into modal view
            modalScope.isModal = true;
            modalScope.modalInstance = $modal.open({
                templateUrl: '/app/features/zHierarchy/zHierarchyItem.html',
                controller: 'zHierarchyItemController as vm',
                size: 'lg',
                scope: modalScope, // <- This is it!
                //resolve: {
                //    isModal: true
                //}
            });

            modalScope.modalInstance.result.then(function (newZHierarchy) {

                if (newZHierarchy) {
                    vm.zHierarchys.push(newZHierarchy);
                    vm.selectedZHierarchy = vm.zHierarchys[vm.zHierarchys.length - 1].zHierarchyID;
                    vm.allDataType.zHierarchyID = vm.selectedZHierarchy;
                    vm.isSaving = false;
                    vm.hasChanges = true;
                }

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

        };
        // #endregion
    }
    // #endregion
})();

