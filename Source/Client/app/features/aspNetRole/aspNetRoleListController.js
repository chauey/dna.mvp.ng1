// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'aspNetRoleListController';

	// 1. Add controller to module
	angular
		.module('app.features')
		.controller(controllerId, AspNetRoleListController);

	// 2. Inject dependencies
	AspNetRoleListController.$inject = ['$location', 'common', 'config', 'datacontext'];

	// 3. Define controller
	function AspNetRoleListController($location, common, config, datacontext) {
		
		// #region 3.1. Setup variables and functions
		var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
		// #endregion

		// #region 3.2. Expose public bindable interface
		// #region Breeze client-side cached
		vm.aspNetRoles = [];
		vm.aspNetRoleCount = 0;
		vm.aspNetRoleFilteredCount = 0;
		vm.aspNetRoleSearch = '';

		vm.title = 'AspNetRoles';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToAspNetRole = goToAspNetRole;

		vm.paging = {
			currentPage: 1,
            currentPageServer: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.aspNetRoleFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = ['Name']; // Table headers
		vm.sorting = {
			orderBy: 'name',
			orderDesc: ''
		};
		// #endregion

        // #region server-side remote acess
        
        vm.aspNetRolesServer = [];
        vm.aspNetRolesServerFilter = [];
        vm.aspNetRoleCountServer = 0;
        vm.aspNetRoleFilteredCountServer = 0;
        vm.aspNetRoleServerSearch = '';
        vm.setAspNetRolesServerFilter = setAspNetRolesServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.aspNetRoleFilteredCountServer / vm.paging.pageSize) + 1;
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
			common.activateController([getAspNetRolesServer()

], controllerId)
				.then(function () { log('Activated AspNetRoles View.'); });
		}


		function getAspNetRoles(forceRefresh) {
			return datacontext.aspNetRole.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.aspNetRoleSearch)
				.then(function (data) {
					vm.aspNetRoles = data;
					
                    if (!vm.aspNetRoleCount || forceRefresh) {
						// Only grab the full count once or on refresh
						getAspNetRoleCount();
					}
					getAspNetRoleFilteredCount();
					return data;
				}
			);
		}

		function getAspNetRolesServer(forceRefresh) {
            return datacontext.aspNetRole.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.aspNetRoleServerSearch)
                .then(function(data) {
                    vm.aspNetRolesServerFilter = data;

                    if (!vm.aspNetRoleFilteredCountServer || forceRefresh) {
                        getAspNetRoleCountServer();
                    }

                    getAspNetRoleFilteredCountServer();

                    return data;
                });
        }

		// #region Get Counts
		function getAspNetRoleCount() {
			return datacontext.aspNetRole.getCount().then(function (data) {
				return vm.aspNetRoleCount = data;
			});
		}

		function getAspNetRoleFilteredCount() {
            vm.aspNetRoleFilteredCount = datacontext.aspNetRole.getFilteredCount(vm.aspNetRoleSearch);
		}

		function getAspNetRoleCountServer() {
            return datacontext.aspNetRole.getCount().then(function (data) {
                return vm.aspNetRoleCountServer = data;
            });
        }

        function getAspNetRoleFilteredCountServer() {
            datacontext.aspNetRole.getFilteredCountServer(vm.aspNetRoleServerSearch)
                .then(function(count) {
                    vm.aspNetRoleFilteredCountServer = count;
                });
        }
		// #endregion

		// #region Paging/Sorting/Filtering
		function pageChanged() {
			getAspNetRoles();
		}

		function pageChangedServer() {
            getAspNetRolesServer();
        }

		function refresh() { getAspNetRoles(true); }
		function refreshServer() { getAspNetRolesServer(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.aspNetRoleSearch = ''; }
			getAspNetRoles();
		}

		function searchServer() {
            return getAspNetRolesServer();
        }

        function setAspNetRolesServerFilter(aspNetRole) {
            var textContains = common.textContains;
            var searchText = vm.aspNetRolesServerSearch;

            var isMatch = searchText
                ? textContains(aspNetRole.name, searchText)
                || textContains(aspNetRole.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getAspNetRoles();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getAspNetRolesServer();
        }
		// #endregion

		function goToAspNetRole(aspNetRole) {
			if (aspNetRole && aspNetRole.id) {
				$location.path('/role/' + aspNetRole.id);
			}
		}




		// #endregion
	}
	// #endregion
})();

