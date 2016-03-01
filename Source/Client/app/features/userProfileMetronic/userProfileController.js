// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'UserProfileController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, UserProfileController);

    // 2. Inject dependencies
    UserProfileController.$inject = ['$rootScope', '$scope', '$http', '$timeout', 'common', 'datacontext',
        '$location', '$stateParams', '$window', 'bootstrap.dialog', 'config', 'commonConfig',
        'datePickerConfig', 'model', 'urlHelper', 'FileUploader', 'authService', 'accountService'];

    // #region 3. Define controller
    function UserProfileController($rootScope, $scope, $http, $timeout, common, datacontext, $location,
        $stateParams, $window, bsDialog, config, commonConfig, datePickerConfig, model, urlHelper,
        FileUploader, authService, accountService) {

        // #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var entityName = model.entityNames.user;
        var wipEntityKey = undefined;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.authentication = authService.authentication;
        vm.user = undefined;
        vm.oldPassword = '';
        vm.newPassword = '';
        vm.confirmPassword = '';

        // Upload photo
        vm.rootFilePath = '/UploadFiles';
        vm.isAddingPhoto = false;
        vm.localPhotoUrl = '';
        vm.newPhotoUrl = '';
        vm.uploader = new FileUploader({
            url: "/api/File/",
            formData: [{
                userID: '',
                isNew: false
            }]
        });

        vm.uploader.onAfterAddingFile = function (fileItem) {
            // Set adding trigger
            vm.isAddingPhoto = true;

            // Get local photo URL
            vm.localPhotoUrl = URL.createObjectURL(fileItem._file);

            // Set data for photoUrl
            //vm.user.photoUrl = fileItem.file.name;
            vm.newPhotoUrl = fileItem.file.name;

            // Set data for FormData
            fileItem.formData[0].userID = vm.user.userID;

            var val = $stateParams.id;
            if (val === 'new') {
                fileItem.formData[0].isNew = true;
            }
        };

        vm.uploader.onCompleteItem = function (fileItem, response, status, headers) {
            // Set adding trigger
            vm.isAddingPhoto = false;
            vm.user.photoUrl = vm.newPhotoUrl;
            save();

            // 
            vm.newPhotoUrl = '';
            vm.uploader.queue = [];
        };

        // FILTERS
        vm.uploader.filters.push({
            name: 'customFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 10;
            }
        });

        vm.getPhotoByUrl = getPhotoByUrl;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalUser = null;

        vm.statuss = [];
        vm.govts = [];
        vm.customers = [];
        vm.iUsers = [];

        vm.cancel = cancel;
        vm.save = save;
        vm.changePassword = changePassword;
        vm.cancelUpload = cancelUpload;
        vm.cancelChangePassword = cancelChangePassword;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canUpload', {
            get: canUpload
        });

        Object.defineProperty(vm, 'canChangePassword', {
            get: canChangePassword
        });

        // For DateTime fields

        vm.datePickerConfig = datePickerConfig;

        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
            initLookups();
            common.activateController([getUserIdByUserName()], controllerId)
    .then(onEveryChange());
        }

        function getUserIdByUserName() {
            // Only retrieve user data if the path is not 'dashboard'
            if ($location.$$path.indexOf('dashboard') < 0) {
                if ($rootScope.aspNetUser != null && $rootScope.aspNetUser != undefined
                            && $rootScope.aspNetUser.userName == vm.authentication.userName) {
                    // If the aspNetUser is stored in rootScope with the same userName, then use its id to get User
                    getRequestedUser($rootScope.aspNetUser.id);
                }
                else {
                    // Clear data in $rootScope
                    $rootScope.currentUser = $rootScope.aspNetUser = null;

                    // Get user id from DB first
                    datacontext.aspNetUser.getIdByUserName(vm.authentication.userName)
                        .then(function (data) {

                            if (data.results != null && data.results.length > 0) {
                                // Store aspNetUser in $rootScope.aspNetUser
                                $rootScope.aspNetUser = data.results[0];

                                // Get User
                                getRequestedUser($rootScope.aspNetUser.id)
                            }

                        }, function (error) {
                            logError('Unable to get AspNetUser ' + vm.authentication.userName);
                        });
                }
            }
        }

        function getRequestedUser(userId) {
            if ($rootScope.currentUser != null && $rootScope.currentUser != undefined) {

                // If currentUser is stored in rootScope, use its data
                vm.actionType = 'U'; // For audit log
                vm.originalUser = cloneUser($rootScope.currentUser);

                // If get data from WIP, need to use data.entity, otherwise use data.
                wipEntityKey = $rootScope.currentUser.key;
                vm.user = $rootScope.currentUser;
            }
            else {
                // Else, get User data from Wip or DB
                return datacontext.user.getEntityByIdOrFromWip(userId)
                .then(function (data) {
                    // Store the current User to $rootScope.currentUser
                    $rootScope.currentUser = data.entity || data;

                    vm.actionType = 'U'; // For audit log
                    vm.originalUser = cloneUser($rootScope.currentUser);

                    // If get data from WIP, need to use data.entity, otherwise use data.
                    wipEntityKey = $rootScope.currentUser.key;
                    vm.user = $rootScope.currentUser;
                }, function (error) {
                    logError('Unable to get User ' + userId);
                });
            }
        }

        //#region Save - Cancel
        function cancel() {
            datacontext.cancel();
            removeWipEntity();

            // Cancel changes - Reset User Data
            getUserIdByUserName();

            //urlHelper.replaceLocationUrlGuidWithId(vm.user.userID);
            //if (vm.user.entityAspect.entityState.isDetached()) {
            //    goToUsers();
            //}
        }

        //function goToUsers() {
        //    $location.path('/users');
        //}

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

        function canUpload() {
            return (vm.uploader.queue != null && vm.uploader.queue != undefined && vm.uploader.queue.length > 0);
        }

        function canChangePassword() {
            if (vm.oldPassword == null || vm.oldPassword == undefined || vm.oldPassword.length == 0
                || vm.newPassword == null || vm.newPassword == undefined || vm.newPassword.length == 0
                || vm.confirmPassword == null || vm.confirmPassword == undefined || vm.confirmPassword.length == 0) {
                return false;
            }
            else {
                //// Check password strength
                //var passwordStrength = common.strongPasswordChecker(vm.newPassword);
                //if (passwordStrength == "weak" || passwordStrength == "") {
                //    logError('Weak password, try to use a long mixed password with: ' + '<br/>' +
                //        '- lower-case characters' + '<br/>' +
                //        '- upper-case characters' + '<br/>' +
                //        '- digits' + '<br/>' +
                //        '- unique characters.');
                //    return false;
                //}
                //else
                if (vm.newPassword === vm.confirmPassword && vm.oldPassword !== vm.newPassword) {
                    return true;
                }
            }

            return false;
        }

        function save() {
            vm.isSaving = true;

            // Save Changes
            return datacontext.save()
                .then(function (saveResult) {
                    vm.isSaving = false;

                    // Save Audit Log
                    common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.user,
                                        vm.actionType != 'D' ? vm.originalUser : cloneUser(vm.user),
                                        vm.actionType != 'D' ? cloneUser(vm.user) : null);

                    removeWipEntity();
                    //urlHelper.replaceLocationUrlGuidWithId(vm.user.userID);
                }, function (error) {
                    vm.isSaving = false;
                });
        }

        function changePassword() {
            accountService.changePassword({
                oldPassword: vm.oldPassword,
                newPassword: vm.newPassword,
                confirmPassword: vm.confirmPassword
            }).then(_updateSuccess).catch(_updateFailed);
        }

        function _updateSuccess(response) {
            cancelChangePassword();
            logSuccess('Update success.');
        }

        function _updateFailed(response) {
            cancelChangePassword()
            logError('Update failed: ' + response.statusText + '.');
        }

        function cancelUpload() {
            vm.newPhotoUrl = '';
            vm.uploader.queue = [];
        }

        function cancelChangePassword() {
            vm.oldPassword = vm.newPassword = vm.confirmPassword = '';
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }
        //#endregion

        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;

            vm.statuss = lookups.statuss;

            vm.govts = lookups.govts;

            vm.customers = lookups.customers;

            vm.iUsers = lookups.iUsers;
        }

        //#region Work in progress
        function storeWipEntity() {
            if (!vm.user) { return; }
            var description = vm.user.name || '[New User] id: ' + vm.user.userID; // Need to change "name" to a main property that we want to show to user

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
        //#endregion

        function cloneUser(user) {
            return {
                UserID: user.userID,
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
                CustomerID: user.customerID,
                Anniversary: user.anniversary,
                Spouse: user.spouse,
                Children: user.children,
                IUserID: user.iUserID,
                PhotoUrl: user.photoUrl,
                PledgeAmount: user.pledgeAmount,
                NewsLetterEmail: user.newsLetterEmail,
                OtherInfo: user.otherInfo,
                Birthday: user.birthday,
            };
        }

        // #region upload photo events
        function getPhotoByUrl(photoUrl) {
            if (photoUrl != null && photoUrl != undefined && photoUrl != '') {
                if (vm.isAddingPhoto) {
                    return vm.localPhotoUrl;
                }

                return '../../../UploadFiles/' + photoUrl;
            }
            else {
                return '../../../Content/images/userProfileDefault.jpg';
            }
        }
        // #endregion
        // #endregion

        // From Metronic theme
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            Metronic.initAjax();
            Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_profile')); // set profile link active in sidebar menu 

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
        });
    }
    // #endregion

})();