(function () {
    'use strict';

    var controllerId = 'topnav';

    angular.module('app.layout').controller(controllerId,
        ['$rootScope', '$scope', '$location', 'authService', 'bootstrap.dialog', 'datacontext','common', topnav]);

    function topnav($rootScope, $scope, $location, authService, bsDialog, datacontext, common) {
        var vm = this;
        var logError = common.logger.getLogFn(this.serviceId, 'error', 'config');

        vm.logout = logout;
        vm.authentication = authService.authentication;
        vm.getPhotoByUrl = getPhotoByUrl;
        vm.user = null;

        function logout() {
            return bsDialog.confirmationDialog('Logout', 'Do you want to logout?', 'Yes', 'No')
                .then(confirm);

            function confirm() {
                authService.logout();
                // Clear data in $rootScope
                $rootScope.currentUser = $rootScope.aspNetUser = null;
                $rootScope.accessControlList = null;
                $location.path('/login');
            }
        }


        // TODO: uncomment for later working
        $scope.$watch('vm.authentication.isAuth', function () {
            if (vm.authentication.isAuth == true) {

                // May not need for now, just want to get AspNetUser to show the FirstName, LastName; instead of username
                //getUserIdByUserName();

                // force refresh to reload the side bar menu
                
            }

            $rootScope.$broadcast('authenticationChanged');
        });

        // #region Get logged in user
        function getUserIdByUserName() {
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

        function getRequestedUser(userId) {
            if ($rootScope.currentUser != null && $rootScope.currentUser != undefined) {
                vm.user = $rootScope.currentUser;
            }
            else {
                // Else, get User data from Wip or DB
                return datacontext.user.getEntityByIdOrFromWip(userId)
                .then(function (data) {
                    // Store the current User to $rootScope.currentUser
                    $rootScope.currentUser = data.entity || data;
                    vm.user = $rootScope.currentUser;
                }, function (error) {
                    logError('Unable to get User ' + userId);
                });
            }
        }
        // #endregion

        // #region upload photo events
        function getPhotoByUrl(photoUrl) {
            if (photoUrl != null && photoUrl != undefined && photoUrl != '') {
                return '../../../UploadFiles/' + photoUrl;
            }
            else {
                return '../../../Content/images/userProfileDefault.jpg';
            }
        }
        // #endregion
    }
})();
