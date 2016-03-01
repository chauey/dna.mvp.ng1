// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'aspNetUserListController';

	// 1. Get 'app' module and define controller
	angular
		.module('app.features')
		.controller(controllerId, AspNetUserListController);

	// 2. Inject dependencies
	AspNetUserListController.$inject = ['$location', 'common', 'config', 'datacontext'];

	// #region 3. Define controller
	function AspNetUserListController($location, common, config, datacontext) {
		
		// #region 3.1. Define functions
		var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
		// #endregion

		// #region 3.2. Define bindable variables to the view
		// #region Breeze client-side cached
		vm.aspNetUsers = [];
		vm.aspNetUserCount = 0;
		vm.aspNetUserFilteredCount = 0;
		vm.aspNetUserSearch = '';

		vm.title = 'AspNetUsers';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToAspNetUser = goToAspNetUser;

		vm.paging = {
			currentPage: 1,
            currentPageServer: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.aspNetUserFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = ['Email','EmailConfirmed','PasswordHash','SecurityStamp','PhoneNumber','PhoneNumberConfirmed','TwoFactorEnabled','LockoutEndDateUtc','LockoutEnabled','AccessFailedCount','UserName']; // Table headers
		vm.sorting = {
			orderBy: 'userName',
			orderDesc: ''
		};
		// #endregion

        // #region server-side remote acess
        
        vm.aspNetUsersServer = [];
        vm.aspNetUsersServerFilter = [];
        vm.aspNetUserCountServer = 0;
        vm.aspNetUserFilteredCountServer = 0;
        vm.aspNetUserServerSearch = '';
        vm.setAspNetUsersServerFilter = setAspNetUsersServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.aspNetUserFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
			orderBy: 'userName',
			orderDesc: ''
		};

      
        // #endregion
		// #endregion

		// 3.3. Run activate method
		activate();

		// #region 3.4. Controller functions implementation
		function activate() {
			common.activateController([getAspNetUsers() 
                                       ,getAspNetUsersServer()

], controllerId)
				.then(function () { log('Activated AspNetUsers View.'); });
		}


		function getAspNetUsers(forceRefresh) {
			return datacontext.aspNetUser.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.aspNetUserSearch)
				.then(function (data) {
					vm.aspNetUsers = data;
					
                    if (!vm.aspNetUserCount || forceRefresh) {
						// Only grab the full count once or on refresh
						getAspNetUserCount();
					}
					getAspNetUserFilteredCount();
					return data;
				}
			);
		}

		function getAspNetUsersServer(forceRefresh) {
            return datacontext.aspNetUser.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.aspNetUserServerSearch)
                .then(function(data) {
                    vm.aspNetUsersServerFilter = data;

                    if (!vm.aspNetUserFilteredCountServer || forceRefresh) {
                        getAspNetUserCountServer();
                    }

                    getAspNetUserFilteredCountServer();

                    return data;
                });
        }

		// #region Get Counts
		function getAspNetUserCount() {
			return datacontext.aspNetUser.getCount().then(function (data) {
				return vm.aspNetUserCount = data;
			});
		}

		function getAspNetUserFilteredCount() {
            vm.aspNetUserFilteredCount = datacontext.aspNetUser.getFilteredCount(vm.aspNetUserSearch);
		}

		function getAspNetUserCountServer() {
            return datacontext.aspNetUser.getCount().then(function (data) {
                return vm.aspNetUserCountServer = data;
            });
        }

        function getAspNetUserFilteredCountServer() {
            datacontext.aspNetUser.getFilteredCountServer(vm.aspNetUserServerSearch)
                .then(function(count) {
                    vm.aspNetUserFilteredCountServer = count;
                });
        }
		// #endregion

		// #region Paging/Sorting/Filtering
		function pageChanged() {
			getAspNetUsers();
		}

		function pageChangedServer() {
            getAspNetUsersServer();
        }

		function refresh() { getAspNetUsers(true); }
		function refreshServer() { getAspNetUsersServer(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.aspNetUserSearch = ''; }
			getAspNetUsers();
		}

		function searchServer() {
            return getAspNetUsersServer();
        }

        function setAspNetUsersServerFilter(aspNetUser) {
            var textContains = common.textContains;
            var searchText = vm.aspNetUsersServerSearch;

            var isMatch = searchText
                ? textContains(aspNetUser.name, searchText)
                || textContains(aspNetUser.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getAspNetUsers();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getAspNetUsersServer();
        }
		// #endregion

		function goToAspNetUser(aspNetUser) {
			if (aspNetUser && aspNetUser.aspNetUserID) {
				$location.path('/aspNetUser/' + aspNetUser.aspNetUserID);
			}
		}




		// #endregion
	}
	// #endregion
})();

