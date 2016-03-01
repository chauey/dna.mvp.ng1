(function () {
    'use strict';

    var controllerId = 'sidebar';
    angular.module('app.layout').controller(controllerId,
        ['$scope', '$state', 'bootstrap.dialog', 'config',
            'datacontext', 'routes', '$rootScope', 'authService', 'aclService', sidebar]);

    function sidebar($scope, $state, bsDialog, config,
        datacontext, routes, $rootScope, authService, aclService) {

        var vm = this;
        vm.clearStorage = clearStorage;
        vm.routes = routes;
        vm.wip = [];
        vm.wipChangedEvent = config.events.storage.wipChanged;

        vm.isCurrent = isCurrent;

        vm.authentication = authService.authentication;

        activate();

        function activate() {
            getNavRoutes();
            //getNavRoutesChildLevel();
            vm.wip = datacontext.zStorageWip.getWipSummary();

            //Layout.initSidebar(); // init sidebar
        }

        function getNavRoutes() {
            // Get the cached access control list from root scope
/* <<<<<<< Updated upstream
            var accessControlList = $rootScope.accessControlList;

            if (accessControlList != null && accessControlList.length > 0) {
                // If the cached data exists, filter the navigating routes with it.
                vm.navRoutes = filterNavRoutes(accessControlList);
                vm.navRoutesChildLevels = filterNavRoutesChildLevel(accessControlList);
            }
            else {
                // Else, the cached data doesn't exist, get the access control list from server.
                //datacontext.domainObject.getAllAccessControlListAndPermissions('name')
                //    .then(function (data) {
                //        // then filter the navigating routes with the returned data
                //        vm.navRoutes = filterNavRoutes(data);
                //        vm.navRoutesChildLevels = filterNavRoutesChildLevel(data);
                //    }
                //);

                // TODO: get list of Permission?

                var domainObjectExpandQuery = 'domainObject';

                datacontext.accessControlListItem.getAllWithoutPaging(null, domainObjectExpandQuery)
                    .then(function (response) {
                        var odata = response;

                        $rootScope.accessControlList = odata;

                        vm.navRoutes = filterNavRoutes(odata);
                        vm.navRoutesChildLevels = filterNavRoutesChildLevel(odata);
                    });
            }
======= */
            var promise = aclService.getAllAccessControlListAndPermissions('name');
            promise.then(function (result) {
                var accessControlList = result.accessControlList;

                if (accessControlList != null && accessControlList != undefined && accessControlList.length > 0) {
                    // If the cached data exists, filter the navigating routes with it.
                    vm.navRoutes = filterNavRoutes(accessControlList);
                    vm.navRoutesChildLevels = filterNavRoutesChildLevel(accessControlList);
                }
            });
/* >>>>>>> Stashed changes */
        }

        function filterNavRoutes(accessControlList) {
            return routes.filter(function (r) {
                return r.config.settings && r.config.settings.nav && !r.config.settings.isChildLevel
                    && (!(r.config && r.config.domainObjectName) || isDomainObjectInRole(accessControlList, r.config.domainObjectName));
            }).sort(function (r1, r2) {
                return r1.config.settings.nav - r2.config.settings.nav;
            });
        }

        function filterNavRoutesChildLevel(accessControlList) {
            return routes.filter(function (r) {
                return r.config.settings && r.config.settings.nav && r.config.settings.isChildLevel
                    && (!(r.config && r.config.domainObjectName) || isDomainObjectInRole(accessControlList, r.config.domainObjectName));
            }).sort(function (r1, r2) {
                return r1.config.settings.nav - r2.config.settings.nav;
            });
        }

        // Check in the access control list to see if the current role has permission to view a domain object
        function isDomainObjectInRole(accessControlList, domainObjectName) {
            if (accessControlList != null && accessControlList.length > 0) {
                for (var i = 0; i < accessControlList.length; i++) {
                    if (accessControlList[i].domainObject.name == domainObjectName) { // && accessControlList[i].Role.Name == roleName) {
                        return true;
                    }
                }
            }

            return false;
        }

        function isCurrent(route) {
            if (!route.config.title || !$state.current || !$state.current.title) {
                return '';
            }
            var menuName = route.config.title;
            return $state.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
        }

        function clearStorage() {
            return bsDialog.deleteDialog('Local Storage and Work In Progress')
                .then(confirmDelete, cancelDelete);

            function confirmDelete() {
                datacontext.zStorage.clear();
            }

            function cancelDelete() { }
        }

        $rootScope.$on('authenticationChanged', function () {
            activate();
        });
    };
})();
