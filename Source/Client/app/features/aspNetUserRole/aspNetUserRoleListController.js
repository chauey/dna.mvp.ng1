// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'aspNetUserRoleListController';

	// 1. Get 'app' module and define controller
	angular
		.module('app.features')
		.controller(controllerId, AspNetUserRoleListController);

	// 2. Inject dependencies
	AspNetUserRoleListController.$inject = ['$location', 'common', 'config', 'datacontext'];

	// #region 3. Define controller
	function AspNetUserRoleListController($location, common, config, datacontext) {
		
		// #region 3.1. Define functions
		var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
		// #endregion

		// #region 3.2. Define bindable variables to the view
		// #region Breeze client-side cached
		vm.aspNetUserRoles = [];
		vm.aspNetUserRoleCount = 0;
		vm.aspNetUserRoleFilteredCount = 0;
		vm.aspNetUserRoleSearch = '';

		vm.title = 'AspNetUserRoles';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToAspNetUserRole = goToAspNetUserRole;

		vm.paging = {
			currentPage: 1,
            currentPageServer: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.aspNetUserRoleFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = []; // Table headers
		vm.sorting = {
			orderBy: '',
			orderDesc: ''
		};
		// #endregion

        // #region server-side remote acess
        
        vm.aspNetUserRolesServer = [];
        vm.aspNetUserRolesServerFilter = [];
        vm.aspNetUserRoleCountServer = 0;
        vm.aspNetUserRoleFilteredCountServer = 0;
        vm.aspNetUserRoleServerSearch = '';
        vm.setAspNetUserRolesServerFilter = setAspNetUserRolesServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.aspNetUserRoleFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
			orderBy: '',
			orderDesc: ''
		};

       // fields for relative entities 

        vm.selectedUser = null;
        vm.selectedUserServer = null;
           vm.selectedRole = null;
        vm.selectedRoleServer = null;
         
        // #endregion
		// #endregion

		// 3.3. Run activate method
		activate();

		// #region 3.4. Controller functions implementation
		function activate() {
			common.activateController([getAspNetUserRoles() 
                                       ,getAspNetUserRolesServer()
    ,getUsers()
       ,getRoles()
   
], controllerId)
				.then(function () { log('Activated AspNetUserRoles View.'); });
		}

  function getUsers() {
            return datacontext.user.getAllWithoutPaging().then(function (data) {
                vm.users = data;
            });
        }
     function getRoles() {
         return datacontext.aspNetRole.getAllWithoutPaging().then(function (data) {
                vm.roles = data;
            });
        }
   
		function getAspNetUserRoles(forceRefresh) {
			return datacontext.aspNetUserRole.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.aspNetUserRoleSearch)
				.then(function (data) {
					vm.aspNetUserRoles = data;
					
                    if (!vm.aspNetUserRoleCount || forceRefresh) {
						// Only grab the full count once or on refresh
						getAspNetUserRoleCount();
					}
					getAspNetUserRoleFilteredCount();
					return data;
				}
			);
		}

		function getAspNetUserRolesServer(forceRefresh) {
            return datacontext.aspNetUserRole.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.aspNetUserRoleServerSearch)
                .then(function(data) {
                    vm.aspNetUserRolesServerFilter = data;

                    if (!vm.aspNetUserRoleFilteredCountServer || forceRefresh) {
                        getAspNetUserRoleCountServer();
                    }

                    getAspNetUserRoleFilteredCountServer();

                    return data;
                });
        }

		// #region Get Counts
		function getAspNetUserRoleCount() {
			return datacontext.aspNetUserRole.getCount().then(function (data) {
				return vm.aspNetUserRoleCount = data;
			});
		}

		function getAspNetUserRoleFilteredCount() {
            vm.aspNetUserRoleFilteredCount = datacontext.aspNetUserRole.getFilteredCount(vm.aspNetUserRoleSearch);
		}

		function getAspNetUserRoleCountServer() {
            return datacontext.aspNetUserRole.getCount().then(function (data) {
                return vm.aspNetUserRoleCountServer = data;
            });
        }

        function getAspNetUserRoleFilteredCountServer() {
            datacontext.aspNetUserRole.getFilteredCountServer(vm.aspNetUserRoleServerSearch)
                .then(function(count) {
                    vm.aspNetUserRoleFilteredCountServer = count;
                });
        }
		// #endregion

		// #region Paging/Sorting/Filtering
		function pageChanged() {
			getAspNetUserRoles();
		}

		function pageChangedServer() {
            getAspNetUserRolesServer();
        }

		function refresh() { getAspNetUserRoles(true); }
		function refreshServer() { getAspNetUserRolesServer(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.aspNetUserRoleSearch = ''; }
			getAspNetUserRoles();
		}

		function searchServer() {
            return getAspNetUserRolesServer();
        }

        function setAspNetUserRolesServerFilter(aspNetUserRole) {
            var textContains = common.textContains;
            var searchText = vm.aspNetUserRolesServerSearch;

            var isMatch = searchText
                ? textContains(aspNetUserRole.name, searchText)
                || textContains(aspNetUserRole.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getAspNetUserRoles();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getAspNetUserRolesServer();
        }
		// #endregion

		function goToAspNetUserRole(aspNetUserRole) {
			if (aspNetUserRole && aspNetUserRole.aspNetUserRoleID) {
				$location.path('/aspNetUserRole/' + aspNetUserRole.aspNetUserRoleID);
			}
		}

  // #region Relative entities


        vm.onUserSelectionChange = function () {
            // get all AspNetUserRoles (from local) by UserId.
            if (vm.selectedUser != null) {
                datacontext.aspNetUserRole.getAllByUserId(
                    false,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedUser.userId)
                .then(function (results) {
                    vm.aspNetUserRoles = results;
                    vm.aspNetUserRoleFilteredCount = results.length;
                });
            }
            else {
                getAspNetUserRoles(false);
            }
        }

        vm.onUserServerSelectionChange = function () {
            // get all Patients (from local) by Hospital ID.
            if (vm.selectedUserServer != null) {
                datacontext.aspNetUserRole.getAllByUserID(
                    true,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedUserServer.cptCodeVersionID)
                .then(function (results) {
                    vm.aspNetUserRolesServerFilter = results;
                    vm.aspNetUserRoleFilteredCountServer = results.length;
                });
            }
            else {
                getAspNetUserRolesServer(true);
            }
        }
   
        vm.onRoleSelectionChange = function () {
            // get all AspNetUserRoles (from local) by RoleId.
            if (vm.selectedRole != null) {
                datacontext.aspNetUserRole.getAllByRoleId(
                    false,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedRole.roleId)
                .then(function (results) {
                    vm.aspNetUserRoles = results;
                    vm.aspNetUserRoleFilteredCount = results.length;
                });
            }
            else {
                getAspNetUserRoles(false);
            }
        }

        vm.onRoleServerSelectionChange = function () {
            // get all Patients (from local) by Hospital ID.
            if (vm.selectedRoleServer != null) {
                datacontext.aspNetUserRole.getAllByRoleID(
                    true,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedRoleServer.cptCodeVersionID)
                .then(function (results) {
                    vm.aspNetUserRolesServerFilter = results;
                    vm.aspNetUserRoleFilteredCountServer = results.length;
                });
            }
            else {
                getAspNetUserRolesServer(true);
            }
        }
           // #endregion




		// #endregion
	}
	// #endregion
})();

