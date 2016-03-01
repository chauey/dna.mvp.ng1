// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'userListController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, UserListController);

    // 2. Inject dependencies
    UserListController.$inject = ['$location', 'common', 'config', 'datacontext'];

    // #region 3. Define controller
    function UserListController($location, common, config, datacontext) {
        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var vm = this;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        // #region Breeze client-side cached

        vm.title = 'Users';
        vm.goToUser = goToUser;

        vm.paging = {
            currentPage: 1,
            currentPageServer: 1,
            maxPagesToShow: 5,
            pageSize: 15
        };
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.userFilteredCount / vm.paging.pageSize) + 1;
            }
        });

        vm.theads = ['FirstName', 'MiddleName', 'LastName', 'Email', 'Birthday']; // Table headers
        vm.sorting = {
            orderBy: 'lastName',
            orderDesc: ''
        };
        // #endregion

        // #region server-side remote acess

        vm.usersServer = [];
        vm.usersServerFilter = [];
        vm.userCountServer = 0;
        vm.userFilteredCountServer = 0;
        vm.userServerSearch = '';
        vm.setUsersServerFilter = setUsersServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.userFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
            orderBy: 'lastName',
            orderDesc: ''
        };
        // #endregion
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController([getUsersServer()], controllerId)
	            .then(function () { log('Activated Users View.'); });
        }

        function getUsersServer(forceRefresh) {
            return datacontext.user.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.userServerSearch)
                .then(function (data) {
                    vm.usersServerFilter = data;

                    if (!vm.userFilteredCountServer || forceRefresh) {
                        getUserCountServer();
                    }

                    getUserFilteredCountServer();

                    return data;
                });
        }

        // #region Get Counts
        function getUserCountServer() {
            datacontext.user.getCount()
                  .then(function (count) {
                      vm.userCountServer = count;
                  });
        }
        function getUserFilteredCountServer() {
            datacontext.user.getFilteredCountServer(vm.userServerSearch)
                .then(function (count) {
                    vm.userFilteredCountServer = count;
                });
        }
        // #endregion

        // #region Paging/Sorting/Filtering

        function pageChangedServer() {
            getUsersServer();
        }

        function refreshServer() { getUsersServer(true); }

        function searchServer() {
            return getUsersServer();
        }

        function setUsersServerFilter(user) {
            var textContains = common.textContains;
            var searchText = vm.usersServerSearch;

            var isMatch = searchText
                ? textContains(user.name, searchText)
                || textContains(user.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getUsersServer();
        }
        // #endregion

        function goToUser(user) {
            if (user && user.id) {
                $location.path('/user/' + user.id);
            }
        }

        // #endregion
    }
    // #endregion
})();