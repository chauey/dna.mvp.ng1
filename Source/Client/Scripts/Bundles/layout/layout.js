(function () { 
    'use strict';
    
    var controllerId = 'shell';
    angular.module('app').controller(controllerId,
        ['$rootScope', 'common', 'config', shell]);

    function shell($rootScope, common, config) {
        var vm = this;
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var events = config.events;
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        vm.spinnerOptions = {
            radius: 40,
            lines: 7,
            length: 0,
            width: 30,
            speed: 1.7,
            corners: 1.0,
            trail: 100,
            color: '#F58A00'
        };

        activate();

        function activate() {
            logSuccess('Hot Towel Angular loaded!', null, true);
            common.activateController([], controllerId);
        }

        function toggleSpinner(on) { vm.isBusy = on; }

        $rootScope.$on('$routeChangeStart',
            function (event, next, current) { toggleSpinner(true); }
        );
        
        $rootScope.$on(events.controllerActivateSuccess,
            function (data) { toggleSpinner(false); }
        );

        $rootScope.$on(events.spinnerToggle,
            function (data) { toggleSpinner(data.show); }
        );
    };
})();
(function () { 
    'use strict';
    
    var controllerId = 'sidebar';
    angular.module('app').controller(controllerId,
        ['$route', 'config', 'routes', sidebar]);

    function sidebar($route, config, routes) {
        var vm = this;

        vm.isCurrent = isCurrent;

        activate();

        function activate() { getNavRoutes(); }
        
        function getNavRoutes() {
            vm.navRoutes = routes.filter(function(r) {
                return r.config.settings && r.config.settings.nav;
            }).sort(function(r1, r2) {
                return r1.config.settings.nav - r2.config.settings.nav;
            });
        }
        
        function isCurrent(route) {
            if (!route.config.title || !$route.current || !$route.current.title) {
                return '';
            }
            var menuName = route.config.title;
            return $route.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
        }
    };
})();

(function () {
    'use strict';

    var controllerId = 'topnav';

    angular.module('app.layout').controller(controllerId,
        ['$rootScope', '$scope', '$location', 'authService', 'bootstrap.dialog', 'datacontext', topnav]);

    function topnav($rootScope, $scope, $location, authService, bsDialog, datacontext) {
        var vm = this;

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

        $scope.$watch('vm.authentication.isAuth', function () {
            if (vm.authentication.isAuth == true) {
                getUserIdByUserName();

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

(function () {
    'use strict';

    var controllerId = 'quicksidebar';

    angular.module('app.layout').controller(controllerId,
        ['$scope', '$location', 'authService', 'bootstrap.dialog', quicksidebar]);

    function quicksidebar($scope, $location, authService, bsDialog) {

    }
})();

