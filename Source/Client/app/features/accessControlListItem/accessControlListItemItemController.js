// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'accessControlListItemItemController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, AccessControlListItemItemController);

    // 2. Inject dependencies
    AccessControlListItemItemController.$inject = ['$location', '$stateParams', '$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
    // #region 3. Define controller
    function AccessControlListItemItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

        // #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.accessControlListItem;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.accessControlListItem = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalAccessControlListItem = null;

        vm.domainObjects = [];
        vm.selectedDomainObject = null;
        vm.roles = [];
        vm.selectedRole = null;
        vm.permissions = [];

        vm.readPermission = null;
        vm.writePermission = null;
        vm.deletePermission = null;

        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.selectedDomainObjectChanged = selectedDomainObjectChanged;
        vm.selectedRoleChanged = selectedRoleChanged;
        vm.permissionChanged = permissionChanged;
        vm.deleteAccessControlListItem = deleteAccessControlListItem;
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
        vm.addDomainObject = addDomainObject;
        vm.addRole = addRole;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([getRequestedAccessControlListItem()], controllerId)
    .then();
        }

        function getRequestedAccessControlListItem() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log

                initLookups();
                return vm.accessControlListItem = datacontext.accessControlListItem.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.isCreating = true;
                vm.actionType = 'I'; // For audit log
                initLookups();
                return vm.accessControlListItem = datacontext.accessControlListItem.create();
            }

            return datacontext.accessControlListItem.getById(val)
                .then(function (data) {
                    data = data.data;
                    vm.actionType = 'U'; // For audit log
                    vm.accessControlListItem = data.entity || data;
                    initLookups();
                }, function (error) {
                    logError('Unable to get AccessControlListItem ' + val);
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
                urlHelper.replaceLocationUrlGuidWithId(vm.accessControlListItem.id);
                if (vm.accessControlListItem.entityAspect.entityState.isDetached()) {
                    goToAccessControlListItems();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goBackToList() {
            $location.path('/accessControlListItemList');
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
            vm.accessControlListItem.domainObjectId = vm.selectedDomainObject;

            vm.accessControlListItem.roleId = vm.selectedRole;

            // Save Changes
           
            if (vm.isCreating) {
                return datacontext.accessControlListItem.post(vm.accessControlListItem)
                    .then(function (saveResult) {
                        vm.isSaving = false;
                        goBackToList();
                    }, function (error) {
                        vm.isSaving = false;
                    });
            } else {
                return datacontext.accessControlListItem.put(vm.accessControlListItem.id, vm.accessControlListItem)
                    .then(function (saveResult) {
                        vm.isSaving = false;
                        goBackToList();

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

        function selectedDomainObjectChanged() {
            if (vm.selectedDomainObject != vm.accessControlListItem.domainObjectId) {
                vm.hasChanges = true;
            }
        }

        function selectedRoleChanged() {
            if (vm.selectedRole != vm.accessControlListItem.roleId) {
                vm.hasChanges = true;
            }
        }

        function permissionChanged(permissionText) {

            // Reset permission to 0
            vm.accessControlListItem.permissionValue = 0;

            if (($("#readCheckBox").is(':checked') && $("#readCheckBox").val() == permissionText)
                || ($("#readCheckBox").parent().hasClass('checked') && $("#readCheckBox").val() != permissionText)) {
                vm.accessControlListItem.permissionValue += vm.readPermission.value;
            }

            if (($("#writeCheckBox").is(':checked') && $("#writeCheckBox").val() == permissionText)
                || ($("#writeCheckBox").parent().hasClass('checked') && $("#writeCheckBox").val() != permissionText)) {
                vm.accessControlListItem.permissionValue += vm.writePermission.value;
            }

            if (($("#deleteCheckBox").is(':checked') && $("#deleteCheckBox").val() == permissionText)
                || ($("#deleteCheckBox").parent().hasClass('checked') && $("#deleteCheckBox").val() != permissionText)) {
                vm.accessControlListItem.permissionValue += vm.deletePermission.value;
            }
        }

        function deleteAccessControlListItem() {
            return bsDialog.deleteDialog('AccessControlListItem')
                .then(confirmDelete);

            function confirmDelete() {                
                return datacontext.accessControlListItem.delete(vm.accessControlListItem.id)
                   .then(function (saveResult) {
                       goBackToList();

                   }, function (error) {
                       vm.isSaving = false;
                   });
            }
        }
        //#endregion

        function initLookups() {
            
            datacontext.domainObject.getAllWithoutPaging()
             .then(function (data) {
                 vm.domainObjects = data;
                 if (vm.accessControlListItem !== undefined) {
                     vm.selectedDomainObject = vm.accessControlListItem.domainObjectId;
                 }
             });

            datacontext.aspNetRole.getAllWithoutPaging()
             .then(function (data) {
                 vm.roles = data;
                 if (vm.accessControlListItem !== undefined) {
                     vm.selectedRole = vm.accessControlListItem.roleId;
                 }
             });

            datacontext.permission.getAllWithoutPaging()
            .then(function (data) {
                vm.permissions = data;
                for (var i = 0; i < vm.permissions.length; i++) {
                    if (vm.permissions[i].description == "Read") {
                        vm.readPermission = vm.permissions[i];
                    }

                    if (vm.permissions[i].description == "Write") {
                        vm.writePermission = vm.permissions[i];
                    }

                    if (vm.permissions[i].description == "Delete") {
                        vm.deletePermission = vm.permissions[i];
                    }
                }

                setPermissions();
            });
            
        }

        function setPermissions() {
            if (vm.accessControlListItem !== undefined) {
                if ((vm.accessControlListItem.permissionValue & vm.readPermission.value) == vm.readPermission.value) {
                    $("#readCheckBox").parent().addClass('checked');
                    $("#readCheckBox").prop('checked', true);
                }

                if ((vm.accessControlListItem.permissionValue & vm.writePermission.value) == vm.writePermission.value) {
                    $("#writeCheckBox").parent().addClass('checked');
                    $("#writeCheckBox").prop('checked', true);
                }

                if ((vm.accessControlListItem.permissionValue & vm.deletePermission.value) == vm.deletePermission.value) {
                    $("#deleteCheckBox").parent().addClass('checked');
                    $("#deleteCheckBox").prop('checked', true);
                }
            }
        }
        function cloneAccessControlListItem(accessControlListItem) {
            return {
                Id: accessControlListItem.id,
                DomainObjectId: accessControlListItem.domainObjectId,
                RoleId: accessControlListItem.roleId,
                PermissionValue: accessControlListItem.permissionValue,
                IsActive: accessControlListItem.isActive,
                CreatedDate: accessControlListItem.createdDate,
                CreatedBy: accessControlListItem.createdBy,
                UpdatedDate: accessControlListItem.updatedDate,
                UpdatedBy: accessControlListItem.updatedBy,
            };
        }
        // #endregion
        // #region Modal Dialog
        function addDomainObject() {
            var modalScope = $rootScope.$new();
            // passing parameter into modal view
            modalScope.isModal = true;
            modalScope.modalInstance = $modal.open({
                templateUrl: '/app/features/domainObject/domainObjectItem.html',
                controller: 'domainObjectItemController as vm',
                size: 'lg',
                scope: modalScope, // <- This is it!
                //resolve: {
                //    isModal: true
                //}
            });

            modalScope.modalInstance.result.then(function (newDomainObject) {

                if (newDomainObject) {
                    vm.domainObjects.push(newDomainObject);
                    vm.selectedDomainObject = vm.domainObjects[vm.domainObjects.length - 1].domainObjectId;
                    vm.accessControlListItem.domainObjectId = vm.selectedDomainObject;
                    vm.isSaving = false;
                    vm.hasChanges = true;
                }

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

        };
        function addRole() {
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
                    vm.selectedRole = vm.roles[vm.roles.length - 1].roleId;
                    vm.accessControlListItem.roleId = vm.selectedRole;
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

