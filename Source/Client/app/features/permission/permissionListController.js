// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'permissionListController';

    // 1. Add controller to module
    angular
		.module('app.features')
		.controller(controllerId, PermissionListController);

    // 2. Inject dependencies
    PermissionListController.$inject = ['$location', 'common', 'config', 'datacontext'];

    // 3. Define controller
    function PermissionListController($location, common, config, datacontext) {

        // #region 3.1. Setup variables and functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        var vm = this;
        // #endregion

        // #region 3.2. Expose public bindable interface
        // #region Breeze client-side cached
        vm.permissions = [];
        vm.permissionCount = 0;
        vm.permissionFilteredCount = 0;
        vm.permissionSearch = '';

        vm.title = 'Permissions';
        vm.refresh = refresh;
        vm.search = search;
        vm.goToPermission = goToPermission;

        vm.paging = {
            currentPage: 1,
            currentPageServer: 1,
            maxPagesToShow: 5,
            pageSize: 15
        };
        vm.pageChanged = pageChanged;
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.permissionFilteredCount / vm.paging.pageSize) + 1;
            }
        });

        vm.setSort = setSort;
        vm.theads = ['Value', 'Name', 'Description']; // Table headers
        vm.sorting = {
            orderBy: 'name',
            orderDesc: ''
        };
        // #endregion

        // #region server-side remote acess

        vm.permissionsServer = [];
        vm.permissionsServerFilter = [];
        vm.permissionCountServer = 0;
        vm.permissionFilteredCountServer = 0;
        vm.permissionServerSearch = '';
        vm.setPermissionsServerFilter = setPermissionsServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.permissionFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
            orderBy: 'name',
            orderDesc: ''
        };


        // #endregion
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Implement private functions
        function activate() {
            common.activateController([getPermissionsServer()

            ], controllerId)
				.then(function () { log('Activated Permissions View.'); });
        }


        function getPermissions(forceRefresh) {
            return datacontext.permission.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.permissionSearch)
				.then(function (data) {
				    vm.permissions = data;

				    if (!vm.permissionCount || forceRefresh) {
				        // Only grab the full count once or on refresh
				        getPermissionCount();
				    }
				    getPermissionFilteredCount();
				    return data;
				}
			);
        }

        function getPermissionsServer(forceRefresh) {
            return datacontext.permission.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.permissionServerSearch)
                .then(function (data) {
                    vm.permissionsServerFilter = data;

                    if (!vm.permissionFilteredCountServer || forceRefresh) {
                        getPermissionCountServer();
                    }

                    getPermissionFilteredCountServer();

                    return data;
                });
        }

        // #region Get Counts
        function getPermissionCount() {
            return datacontext.permission.getCount().then(function (data) {
                return vm.permissionCount = data;
            });
        }

        function getPermissionFilteredCount() {
            vm.permissionFilteredCount = datacontext.permission.getFilteredCount(vm.permissionSearch);
        }

        function getPermissionCountServer() {
            return datacontext.permission.getCount().then(function (data) {
                return vm.permissionCountServer = data;
            });
        }

        function getPermissionFilteredCountServer() {
            datacontext.permission.getFilteredCountServer(vm.permissionServerSearch)
                .then(function (count) {
                    vm.permissionFilteredCountServer = count;
                });
        }
        // #endregion

        // #region Paging/Sorting/Filtering
        function pageChanged() {
            getPermissions();
        }

        function pageChangedServer() {
            getPermissionsServer();
        }

        function refresh() { getPermissions(true); }
        function refreshServer() { getPermissionsServer(true); }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) { vm.permissionSearch = ''; }
            getPermissions();
        }

        function searchServer() {
            return getPermissionsServer();
        }

        function setPermissionsServerFilter(permission) {
            var textContains = common.textContains;
            var searchText = vm.permissionsServerSearch;

            var isMatch = searchText
                ? textContains(permission.name, searchText)
                || textContains(permission.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getPermissions();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getPermissionsServer();
        }
        // #endregion

        function goToPermission(permission) {
            if (permission && permission.id) {
                $location.path('/permission/' + permission.id);
            }
        }

        // #endregion
    }
    // #endregion
})();

