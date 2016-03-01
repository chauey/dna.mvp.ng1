

 
 





// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'accessControlListItemListController';

	// 1. Add controller to module
	angular
		.module('app.features')
		.controller(controllerId, AccessControlListItemListController);

	// 2. Inject dependencies
	AccessControlListItemListController.$inject = ['$location', 'common', 'config', 'datacontext'];

	// 3. Define controller
	function AccessControlListItemListController($location, common, config, datacontext) {
		
		// #region 3.1. Setup variables and functions
		var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
		// #endregion

		// #region 3.2. Expose public bindable interface
		// #region Breeze client-side cached
		vm.accessControlListItems = [];
		vm.accessControlListItemCount = 0;
		vm.accessControlListItemFilteredCount = 0;
		vm.accessControlListItemSearch = '';

		vm.title = 'AccessControlListItems';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToAccessControlListItem = goToAccessControlListItem;

		vm.paging = {
			currentPage: 1,
            currentPageServer: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.accessControlListItemFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = ['PermissionValue', 'Role', 'DomainObject']; // Table headers
		vm.sorting = {
			orderBy: 'permissionValue',
			orderDesc: ''
		};
		// #endregion

        // #region server-side remote acess
        
        vm.accessControlListItemsServer = [];
        vm.accessControlListItemsServerFilter = [];
        vm.accessControlListItemCountServer = 0;
        vm.accessControlListItemFilteredCountServer = 0;
        vm.accessControlListItemServerSearch = '';
        vm.setAccessControlListItemsServerFilter = setAccessControlListItemsServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.accessControlListItemFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
			orderBy: 'permissionValue',
			orderDesc: ''
		};

       // fields for relative entities 

        vm.selectedRole = null;
        vm.selectedRoleServer = null;
           vm.selectedDomainObject = null;
        vm.selectedDomainObjectServer = null;
         
        // #endregion
		// #endregion

		// 3.3. Run activate method
		activate();

		// #region 3.4. Implement private functions
		function activate() {
			common.activateController([getAccessControlListItemsServer(), getDomainObjects(), getRoles()], controllerId)
				.then(function () { log('Activated AccessControlListItems View.'); });
		}

  function getRoles() {
            return datacontext.aspNetRole.getAllWithoutPaging('name').then(function (data) {
                vm.roles = data;
            });
        }
     function getDomainObjects() {
            return datacontext.domainObject.getAllWithoutPaging('name').then(function (data) {
                vm.domainObjects = data;
            });
        }
   
		function getAccessControlListItemsServer(forceRefresh) {
            return datacontext.accessControlListItem.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.accessControlListItemServerSearch)
                .then(function(data) {
                    vm.accessControlListItemsServerFilter = data;

                    if (!vm.accessControlListItemFilteredCountServer || forceRefresh) {
                        getAccessControlListItemCountServer();
                    }

                    getAccessControlListItemFilteredCountServer();

                    return data;
                });
        }

		// #region Get Counts
		function getAccessControlListItemCount() {
			return datacontext.accessControlListItem.getCount().then(function (data) {
				return vm.accessControlListItemCount = data;
			});
		}

		function getAccessControlListItemFilteredCount() {
            vm.accessControlListItemFilteredCount = datacontext.accessControlListItem.getFilteredCount(vm.accessControlListItemSearch);
		}

		function getAccessControlListItemCountServer() {
            return datacontext.accessControlListItem.getCount().then(function (data) {
                return vm.accessControlListItemCountServer = data;
            });
        }

        function getAccessControlListItemFilteredCountServer() {
            datacontext.accessControlListItem.getFilteredCountServer(vm.accessControlListItemServerSearch)
                .then(function(count) {
                    vm.accessControlListItemFilteredCountServer = count;
                });
        }
		// #endregion

		// #region Paging/Sorting/Filtering
		function pageChanged() {
			getAccessControlListItems();
		}

		function pageChangedServer() {
            getAccessControlListItemsServer();
        }

		function refresh() { getAccessControlListItems(true); }
		function refreshServer() { getAccessControlListItemsServer(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.accessControlListItemSearch = ''; }
			getAccessControlListItems();
		}

		function searchServer() {
            return getAccessControlListItemsServer();
        }

        function setAccessControlListItemsServerFilter(accessControlListItem) {
            var textContains = common.textContains;
            var searchText = vm.accessControlListItemsServerSearch;

            var isMatch = searchText
                ? textContains(accessControlListItem.name, searchText)
                || textContains(accessControlListItem.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getAccessControlListItems();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getAccessControlListItemsServer();
        }
		// #endregion

		function goToAccessControlListItem(accessControlListItem) {
			if (accessControlListItem && accessControlListItem.id) {
				$location.path('/accessControlListItem/' + accessControlListItem.id);
			}
		}

  // #region Relative entities


        vm.onRoleServerSelectionChange = function () {
            if (vm.selectedRoleServer != null) {
                datacontext.accessControlListItem.getAllByRoleId(vm.selectedRoleServer.id)
                .then(function (results) {
                    vm.accessControlListItemsServerFilter = results.data.value;
                    vm.accessControlListItemFilteredCountServer = results.length;
                });
            }
            else {
                getAccessControlListItemsServer(true);
            }
        }

        vm.onDomainObjectServerSelectionChange = function () {
            if (vm.selectedDomainObjectServer != null) {
                datacontext.accessControlListItem.getAllByDomainObjectId(vm.selectedDomainObjectServer.id)
                .then(function (results) {
                    debugger;
                    vm.accessControlListItemsServerFilter = results.data.value;
                    vm.accessControlListItemFilteredCountServer = results.length;
                });
            }
            else {
                getAccessControlListItemsServer(true);
            }
        }
           // #endregion




		// #endregion
	}
	// #endregion
})();

