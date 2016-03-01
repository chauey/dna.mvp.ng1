// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'aspNetUserRoleItemController';

	// 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, AspNetUserRoleItemController);

	// 2. Inject dependencies
	AspNetUserRoleItemController.$inject = ['$location', '$stateParams','$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
	// #region 3. Define controller
    function AspNetUserRoleItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

		// #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.aspNetUserRole;
        var wipEntityKey = undefined;
		// #endregion

        // #region 3.2. Define bindable variables to the view
		vm.activate = activate;
        vm.aspNetUserRole = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalAspNetUserRole = null;

					vm.users = [];
            vm.selectedUser =  null;
      			vm.roles = [];
            vm.selectedRole =  null;
      
        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteAspNetUserRole = deleteAspNetUserRole;
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
    				vm.addUser = addUser;
      			vm.addRole = addRole;
      		// #endregion

		// 3.3. Run activate method
        activate();

		// #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
						initLookups(); 
			            common.activateController([getRequestedAspNetUserRole()], controllerId)
                .then(onEveryChange());
        }

        function getRequestedAspNetUserRole() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.aspNetUserRole = datacontext.aspNetUserRole.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.actionType = 'I'; // For audit log
                return vm.aspNetUserRole = datacontext.aspNetUserRole.create();
            }

            return datacontext.aspNetUserRole.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    vm.actionType = 'U'; // For audit log
                    vm.originalAspNetUserRole = cloneAspNetUserRole(data);
                    
					// If get data from WIP, need to use data.entity, otherwise use data.
					wipEntityKey = data.key;
                    vm.aspNetUserRole = data.entity || data;
				                    vm.selectedUser =  vm.aspNetUserRole.userId ;

      			                    vm.selectedRole =  vm.aspNetUserRole.roleId ;

                      }, function (error) {
                    logError('Unable to get AspNetUserRole ' + val);
                    goToAspNetUserRoles();
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
            urlHelper.replaceLocationUrlGuidWithId(vm.aspNetUserRole.aspNetUserRoleID);
            if (vm.aspNetUserRole.entityAspect.entityState.isDetached()) {
                goToAspNetUserRoles();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goToAspNetUserRoles() {
            $location.path('/aspNetUserRoles');
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
	  vm.aspNetUserRole.userId = vm.selectedUser;

     vm.aspNetUserRole.roleId = vm.selectedRole;

   
			// Save Changes
            return datacontext.save("SaveAspNetUserRoles")
                .then(function (saveResult) {
                    vm.isSaving = false;

                    // Save Audit Log
                    common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.aspNetUserRole,
                                        vm.actionType != 'D' ? vm.originalAspNetUserRole : cloneAspNetUserRole(vm.aspNetUserRole),
                                        vm.actionType != 'D' ? cloneAspNetUserRole(vm.aspNetUserRole) : null);

                    removeWipEntity();
                    if (!vm.isModal) {
                    urlHelper.replaceLocationUrlGuidWithId(vm.aspNetUserRole.aspNetUserRoleID);
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

        function deleteAspNetUserRole() {
            return bsDialog.deleteDialog('AspNetUserRole')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                datacontext.markDeleted(vm.aspNetUserRole);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                if (!vm.isModal) {
                    goToAspNetUserRoles();
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
	                      vm.users = lookups.users;
                  if (vm.aspNetUserRole !== undefined) {
                vm.selectedUser =  vm.aspNetUserRole.userId ;
}

                         vm.roles = lookups.roles;
                  if (vm.aspNetUserRole !== undefined) {
                vm.selectedRole =  vm.aspNetUserRole.roleId ;
}

           }

        //#region Work in progress
        function storeWipEntity() {
            if (!vm.aspNetUserRole) { return; }
            var description = vm.aspNetUserRole.name || '[New AspNetUserRole] id: ' + vm.aspNetUserRole.aspNetUserRoleID; // Need to change "name" to a main property that we want to show to user

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.aspNetUserRole, wipEntityKey, entityName, description);
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

        function cloneAspNetUserRole(aspNetUserRole) {
            return {
		            UserId: aspNetUserRole.userId,
		            RoleId: aspNetUserRole.roleId,
		        };
        }
		// #endregion
			// #region Modal Dialog
			function addUser(){
            var modalScope = $rootScope.$new();
            // passing parameter into modal view
            modalScope.isModal = true;
            modalScope.modalInstance = $modal.open({
                templateUrl: '/app/features/user/userItem.html',
                controller: 'userItemController as vm',
                size: 'lg',
                scope: modalScope, // <- This is it!
                //resolve: {
                //    isModal: true
                //}
            });

            modalScope.modalInstance.result.then(function (newUser) {
                
                if (newUser) {
                    vm.users.push(newUser);
                    vm.selectedUser =  vm.users[vm.users.length - 1].userId;
                    vm.aspNetUserRole.userId = vm.selectedUser;
                    vm.isSaving = false;
                    vm.hasChanges = true;
                }

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

} ;
      		function addRole(){
            var modalScope = $rootScope.$new();
            // passing parameter into modal view
            modalScope.isModal = true;
            modalScope.modalInstance = $modal.open({
                templateUrl: '/app/features/role/roleItem.html',
                controller: 'roleItemController as vm',
                size: 'lg',
                scope: modalScope, // <- This is it!
                //resolve: {
                //    isModal: true
                //}
            });

            modalScope.modalInstance.result.then(function (newRole) {
                
                if (newRole) {
                    vm.roles.push(newRole);
                    vm.selectedRole =  vm.roles[vm.roles.length - 1].roleId;
                    vm.aspNetUserRole.roleId = vm.selectedRole;
                    vm.isSaving = false;
                    vm.hasChanges = true;
                }

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

} ;
                  // #endregion
			    }
	// #endregion
})();

