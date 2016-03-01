// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'userItemController';

    // 1. Add controller to module
    angular
		.module('app.features')
		.controller(controllerId, userItemController);

    // 2. Inject dependencies


    userItemController.$inject = ['$location', '$stateParams', '$rootScope', '$scope', '$window', '$modal',
                'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper', 'userAspNetRolesListService', 'userAspNetRolesAssignedListService'];
    // 3. Define controller
    function userItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper, userAspNetRolesListService, userAspNetRolesAssignedListService) {
        var vm = this;
        vm.userAspNetRolesListService = userAspNetRolesListService;
        vm.userAspNetRolesAssignedListService = userAspNetRolesAssignedListService;

        // #region 3.1. Setup variables and functions

        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.user;
        var wipEntityKey = undefined;
        // #endregion

        // #region 3.2. Expose public bindable interface
        vm.activate = activate;
        vm.user = undefined;
        vm.isCreating = true;
        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalUser = null;

        vm.ids = [];
        vm.selected = null;
        $scope.$watch('vm.selected', function (newValue, oldValue) {
            if (newValue === oldValue) return;
            vm.hasChanges = true;
        });
        vm.customers = [];
        vm.selectedCustomer = null;
        $scope.$watch('vm.selectedCustomer', function (newValue, oldValue) {
            if (newValue === oldValue) return;
            vm.hasChanges = true;
        });

        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteUser = deleteUser;
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
        vm.assignRole = assignRole;
        vm.unassignRole = aunssignRole;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Implement private functions
        function activate() {
            //onDestroy();
            onHasChanges();
            initLookups();
            common.activateController([getRequestedUser()], controllerId)
    .then(onEveryChange());
        }

        function getRequestedUser() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.user = datacontext.user.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.isCreating = true;
                vm.actionType = 'I'; // For audit log
                return vm.user = datacontext.user.create();
            }

            vm.isCreating = false;
            return datacontext.user.getById(val)
			    .then(function (data) {
			        data = data.data;
			        vm.actionType = 'U'; // For audit log
			        vm.originalUser = cloneUser(data);

			        // If get data from WIP, need to use data.entity, otherwise use data.
			        wipEntityKey = data.key;
			        vm.user = data.entity || data;
			        vm.selected = vm.user.id;

			        vm.selectedCustomer = vm.user.customerId;
			        datacontext.user.getAspNetRolesByRefUserId(vm.user.id).then(function (aspnetRoles) {
			            vm.userAspNetRolesAssignedListService.populateList(aspnetRoles.data);
			        });

			        datacontext.user.getUnassignedAspNetRolesByRefUserId(vm.user.id).then(function (aspnetRoles) {
			            vm.userAspNetRolesListService.populateList(aspnetRoles.data);
			        });
			    }, function (error) {
			        logError('Unable to get User ' + val);
			        goToUsers();
			    });
        }

        // #region Back - Save - Cancel - Delete
        function goBack() {
            $location.path('/user');
        }

        function cancel() {
            goToUsers();
        }

        function goToUsers() {
            goToUsers();
        }

        //function onDestroy() {
        //// $on listens events of a given type
        //$scope.$on('$destroy', function () {
        //autoStoreWip(true);
        //datacontext.cancel();
        //});
        //}

        function canSave() {
            return true;
            //return (vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;
            vm.user.id = vm.selected;

            vm.user.customerId = vm.selectedCustomer;


            // Save Changes
            if (vm.isCreating) {
                return datacontext.user.post(vm.user)
                    .then(function (saveResult) {
                        vm.isSaving = false;

                        // Save Audit Log
                        common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.user,
                                            vm.actionType != 'D' ? vm.originalUser : cloneUser(vm.user),
                                            vm.actionType != 'D' ? cloneUser(vm.user) : null);

                        urlHelper.replaceLocationUrlGuidWithId(vm.user.userId);
                    }, function (error) {
                        vm.isSaving = false;
                    });
            }
            else {
                return datacontext.user.put(vm.user.id, vm.user)
                              .then(function (saveResult) {
                                  vm.isSaving = false;

                                  // Save Audit Log
                                  common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.user,
                                                      vm.actionType != 'D' ? vm.originalUser : cloneUser(vm.user),
                                                      vm.actionType != 'D' ? cloneUser(vm.user) : null);

                                  // Save ref table
                                  datacontext.user.updatedAspNetRoles(vm.user.id, vm.userAspNetRolesAssignedListService.aspNetRoles);
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

        function deleteUser() {
            return bsDialog.deleteDialog('User')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                //datacontext.markDeleted(vm.user);
                datacontext.user.delete(vm.user.id).then(success).catch(failed);

                function success() {
                    removeWipEntity();
                    if (!vm.isModal) {
                        goToUsers();
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
            vm.ids = lookups.ids;
            if (vm.user !== undefined) {
                vm.selected = vm.user.id;
            }

            vm.customers = lookups.customers;
            if (vm.user !== undefined) {
                vm.selectedCustomer = vm.user.customerId;
            }

        }

        // #region Work in progress
        function storeWipEntity() {
            if (!vm.user) { return; }
            var description = vm.user.name || '[New User] id: ' + vm.user.userId; // Need to change "name" to a main property that we want to show to user

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.user, wipEntityKey, entityName, description);
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

        function cloneUser(user) {
            return {
                StatusID: user.statusID,
                CreatedDate: user.createdDate,
                UpdatedDate: user.updatedDate,
                CreateBy: user.createBy,
                UpdateBy: user.updateBy,
                FirstName: user.firstName,
                MiddleName: user.middleName,
                LastName: user.lastName,
                Company: user.company,
                Department: user.department,
                JobTitle: user.jobTitle,
                WorkNumber: user.workNumber,
                WorkFaxNumber: user.workFaxNumber,
                WorkAddress: user.workAddress,
                IM: user.iM,
                Email: user.email,
                MobileNumber: user.mobileNumber,
                WebPage: user.webPage,
                OfficeLocation: user.officeLocation,
                HomeNumber: user.homeNumber,
                HomeAddress: user.homeAddress,
                OtherAddress: user.otherAddress,
                PagerNumber: user.pagerNumber,
                CarNumber: user.carNumber,
                HomeFax: user.homeFax,
                CompanyNumber: user.companyNumber,
                Work2Number: user.work2Number,
                Home2Number: user.home2Number,
                RadioNumber: user.radioNumber,
                IM2: user.iM2,
                IM3: user.iM3,
                Email2: user.email2,
                Email3: user.email3,
                Assistant: user.assistant,
                AssistantNumber: user.assistantNumber,
                Manager: user.manager,
                GovtID: user.govtID,
                Account: user.account,
                Birthday: user.birthday,
                Anniversary: user.anniversary,
                Spouse: user.spouse,
                Children: user.children,
                IUserID: user.iUserID,
                PhotoUrl: user.photoUrl,
                PledgeAmount: user.pledgeAmount,
                NewsLetterEmail: user.newsLetterEmail,
                OtherInfo: user.otherInfo,
                Id: user.id,
                CustomerId: user.customerId,
            };
        }
        // #endregion

        function assignRole() {
            if (vm.userAspNetRolesListService.selectedRole) {
                vm.userAspNetRolesAssignedListService.aspNetRoles.push(vm.userAspNetRolesListService.selectedRole);

                var index = vm.userAspNetRolesListService.aspNetRoles.indexOf(vm.userAspNetRolesListService.selectedRole);
                vm.userAspNetRolesListService.aspNetRoles.splice(index, 1);
            }
        }

        function aunssignRole() {
            if (vm.userAspNetRolesAssignedListService.selectedRole) {
                vm.userAspNetRolesListService.aspNetRoles.push(vm.userAspNetRolesAssignedListService.selectedRole);

                var index = vm.userAspNetRolesAssignedListService.aspNetRoles.indexOf(vm.userAspNetRolesAssignedListService.selectedRole);
                vm.userAspNetRolesAssignedListService.aspNetRoles.splice(index, 1);
            }
        }

    }
    // #endregion
})();

