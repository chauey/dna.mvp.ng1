// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'aspNetUserItemController';

	// 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, AspNetUserItemController);

	// 2. Inject dependencies
	AspNetUserItemController.$inject = ['$location', '$stateParams','$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
	// #region 3. Define controller
    function AspNetUserItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

		// #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.aspNetUser;
        var wipEntityKey = undefined;
		// #endregion

        // #region 3.2. Define bindable variables to the view
		vm.activate = activate;
        vm.aspNetUser = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalAspNetUser = null;

		
        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteAspNetUser = deleteAspNetUser;
        vm.hasChanges = false;
        vm.isSaving = false;
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
    			// #endregion

		// 3.3. Run activate method
        activate();

		// #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
			            common.activateController([getRequestedAspNetUser()], controllerId)
                .then(onEveryChange());
        }

        function getRequestedAspNetUser() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.aspNetUser = datacontext.aspNetUser.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.actionType = 'I'; // For audit log
                return vm.aspNetUser = datacontext.aspNetUser.create();
            }

            return datacontext.aspNetUser.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    vm.actionType = 'U'; // For audit log
                    vm.originalAspNetUser = cloneAspNetUser(data);
                    
					// If get data from WIP, need to use data.entity, otherwise use data.
					wipEntityKey = data.key;
                    vm.aspNetUser = data.entity || data;
	                }, function (error) {
                    logError('Unable to get AspNetUser ' + val);
                    goToAspNetUsers();
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
            removeWipEntity();
            if (!vm.isModal) {
            urlHelper.replaceLocationUrlGuidWithId(vm.aspNetUser.aspNetUserID);
            if (vm.aspNetUser.entityAspect.entityState.isDetached()) {
                goToAspNetUsers();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goToAspNetUsers() {
            $location.path('/aspNetUsers');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }
		
        function canSave() {
            return (vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;
	
			// Save Changes
            return datacontext.save("SaveAspNetUsers")
                .then(function (saveResult) {
                    vm.isSaving = false;

                    // Save Audit Log
                    common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.aspNetUser,
                                        vm.actionType != 'D' ? vm.originalAspNetUser : cloneAspNetUser(vm.aspNetUser),
                                        vm.actionType != 'D' ? cloneAspNetUser(vm.aspNetUser) : null);

                    removeWipEntity();
                    if (!vm.isModal) {
                    urlHelper.replaceLocationUrlGuidWithId(vm.aspNetUser.aspNetUserID);
                    }
                    else {
                        $scope.modalInstance.close(vm.hospital);
                    }
                }, function (error) {
                    vm.isSaving = false;                    
                });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function deleteAspNetUser() {
            return bsDialog.deleteDialog('AspNetUser')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                datacontext.markDeleted(vm.aspNetUser);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                if (!vm.isModal) {
                    goToAspNetUsers();
                }
                    else {
                        $scope.modalInstance.dismiss('cancel');
                    }
                }

                function failed(error) { cancel(); }
            }
        }
        //#endregion

				function initLookups() {
				var lookups = datacontext.lookup.lookupCachedData;
	        }

        //#region Work in progress
        function storeWipEntity() {
            if (!vm.aspNetUser) { return; }
            var description = vm.aspNetUser.name || '[New AspNetUser] id: ' + vm.aspNetUser.aspNetUserID; // Need to change "name" to a main property that we want to show to user

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.aspNetUser, wipEntityKey, entityName, description);
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
        //#endregion

        function cloneAspNetUser(aspNetUser) {
            return {
		            Id: aspNetUser.id,
		            Email: aspNetUser.email,
		            EmailConfirmed: aspNetUser.emailConfirmed,
		            PasswordHash: aspNetUser.passwordHash,
		            SecurityStamp: aspNetUser.securityStamp,
		            PhoneNumber: aspNetUser.phoneNumber,
		            PhoneNumberConfirmed: aspNetUser.phoneNumberConfirmed,
		            TwoFactorEnabled: aspNetUser.twoFactorEnabled,
		            LockoutEndDateUtc: aspNetUser.lockoutEndDateUtc,
		            LockoutEnabled: aspNetUser.lockoutEnabled,
		            AccessFailedCount: aspNetUser.accessFailedCount,
		            UserName: aspNetUser.userName,
		        };
        }
		// #endregion
    }
	// #endregion
})();

