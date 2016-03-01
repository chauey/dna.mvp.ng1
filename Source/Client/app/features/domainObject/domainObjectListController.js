// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'domainObjectListController';

	// 1. Add controller to module
	angular
		.module('app.features')
		.controller(controllerId, DomainObjectListController);

	// 2. Inject dependencies
	DomainObjectListController.$inject = ['$location', 'common', 'config', 'datacontext'];

	// 3. Define controller
	function DomainObjectListController($location, common, config, datacontext) {
		
		// #region 3.1. Setup variables and functions
		var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
		// #endregion

		// #region 3.2. Expose public bindable interface
		// #region Breeze client-side cached
		vm.domainObjects = [];
		vm.domainObjectCount = 0;
		vm.domainObjectFilteredCount = 0;
		vm.domainObjectSearch = '';

		vm.title = 'DomainObjects';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToDomainObject = goToDomainObject;

		vm.paging = {
			currentPage: 1,
            currentPageServer: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.domainObjectFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = ['Name','Description']; // Table headers
		vm.sorting = {
			orderBy: 'name',
			orderDesc: ''
		};
		// #endregion

        // #region server-side remote acess
        
        vm.domainObjectsServer = [];
        vm.domainObjectsServerFilter = [];
        vm.domainObjectCountServer = 0;
        vm.domainObjectFilteredCountServer = 0;
        vm.domainObjectServerSearch = '';
        vm.setDomainObjectsServerFilter = setDomainObjectsServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.domainObjectFilteredCountServer / vm.paging.pageSize) + 1;
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
			common.activateController([getDomainObjectsServer()

], controllerId)
				.then(function () { log('Activated DomainObjects View.'); });
		}


		function getDomainObjects(forceRefresh) {
			return datacontext.domainObject.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.domainObjectSearch)
				.then(function (data) {
					vm.domainObjects = data;
					
                    if (!vm.domainObjectCount || forceRefresh) {
						// Only grab the full count once or on refresh
						getDomainObjectCount();
					}
					getDomainObjectFilteredCount();
					return data;
				}
			);
		}

		function getDomainObjectsServer(forceRefresh) {
            return datacontext.domainObject.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.domainObjectServerSearch)
                .then(function(data) {
                    vm.domainObjectsServerFilter = data;

                    if (!vm.domainObjectFilteredCountServer || forceRefresh) {
                        getDomainObjectCountServer();
                    }

                    getDomainObjectFilteredCountServer();

                    return data;
                });
        }

		// #region Get Counts
		function getDomainObjectCount() {
			return datacontext.domainObject.getCount().then(function (data) {
				return vm.domainObjectCount = data;
			});
		}

		function getDomainObjectFilteredCount() {
            vm.domainObjectFilteredCount = datacontext.domainObject.getFilteredCount(vm.domainObjectSearch);
		}

		function getDomainObjectCountServer() {
            return datacontext.domainObject.getCount().then(function (data) {
                return vm.domainObjectCountServer = data;
            });
        }

        function getDomainObjectFilteredCountServer() {
            datacontext.domainObject.getFilteredCountServer(vm.domainObjectServerSearch)
                .then(function(count) {
                    vm.domainObjectFilteredCountServer = count;
                });
        }
		// #endregion

		// #region Paging/Sorting/Filtering
		function pageChanged() {
			getDomainObjects();
		}

		function pageChangedServer() {
            getDomainObjectsServer();
        }

		function refresh() { getDomainObjects(true); }
		function refreshServer() { getDomainObjectsServer(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.domainObjectSearch = ''; }
			getDomainObjects();
		}

		function searchServer() {
            return getDomainObjectsServer();
        }

        function setDomainObjectsServerFilter(domainObject) {
            var textContains = common.textContains;
            var searchText = vm.domainObjectsServerSearch;

            var isMatch = searchText
                ? textContains(domainObject.name, searchText)
                || textContains(domainObject.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getDomainObjects();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getDomainObjectsServer();
        }
		// #endregion

		function goToDomainObject(domainObject) {
			if (domainObject && domainObject.id) {
				$location.path('/domainObject/' + domainObject.id);
			}
		}




		// #endregion
	}
	// #endregion
})();

