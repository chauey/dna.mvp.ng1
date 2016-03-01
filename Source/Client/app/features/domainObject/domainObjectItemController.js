// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'domainObjectItemController';

	// 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, DomainObjectItemController);

	// 2. Inject dependencies
	DomainObjectItemController.$inject = ['$location', '$stateParams','$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
	// #region 3. Define controller
    function DomainObjectItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

		// #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.domainObject;
		// #endregion

        // #region 3.2. Define bindable variables to the view
		vm.activate = activate;
        vm.domainObject = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalDomainObject = null;

		
        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteDomainObject = deleteDomainObject;
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
			            common.activateController([getRequestedDomainObject()], controllerId)
                .then();
        }

        function getRequestedDomainObject() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log

                return vm.domainObject = datacontext.domainObject.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.isCreating = true;
                vm.actionType = 'I'; // For audit log
                
                return vm.domainObject = datacontext.domainObject.create();
            }

            return datacontext.domainObject.getById(val)
                .then(function (data) {
                    data = data.data;
                    vm.actionType = 'U'; // For audit log
                    vm.domainObject = data.entity || data;
                }, function (error) {
                    logError('Unable to get DomainObject ' + val);
                    goToAccessControlListItems();
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

        function cancel() {
            datacontext.cancel();
            if (!vm.isModal) {
                urlHelper.replaceLocationUrlGuidWithId(vm.domainObject.id);
            if (vm.domainObject.entityAspect.entityState.isDetached()) {
                goBackToList();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goBackToList() {
            $location.path('/domainObjectList');
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
                return datacontext.domainObject.post(vm.domainObject)
                    .then(function (saveResult) {
                        vm.isSaving = false;
                        goBackToList();
                    }, function (error) {
                        vm.isSaving = false;
                    });
            } else {
                return datacontext.domainObject.put(vm.domainObject.id, vm.domainObject)
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

        function deleteDomainObject() {
            return bsDialog.deleteDialog('DomainObject')
                .then(confirmDelete);

            function confirmDelete() {
                return datacontext.domainObject.delete(vm.domainObject.id)
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

      

        function cloneDomainObject(domainObject) {
            return {
		            Id: domainObject.id,
		            Name: domainObject.name,
		            Description: domainObject.description,
		            IsActive: domainObject.isActive,
		            CreatedDate: domainObject.createdDate,
		            CreatedBy: domainObject.createdBy,
		            UpdatedDate: domainObject.updatedDate,
		            UpdatedBy: domainObject.updatedBy,
		        };
        }
		// #endregion
    }
	// #endregion
})();

