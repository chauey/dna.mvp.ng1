// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'ValidationListController';

	// 1. Add controller to module
	angular
		.module('app.features')
		.controller(controllerId, ValidationListController);

	// 2. Inject dependencies
	ValidationListController.$inject = ['$location', 'common', 'config', 'datacontext'];

	// 3. Define controller
	function ValidationListController($location, common, config, datacontext) {
		
		// #region 3.1. Setup variables and functions
		var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
		// #endregion

		// #region 3.2. Expose public bindable interface
		// #region Breeze client-side cached
		vm.validations = [];
		vm.validationCount = 0;
		vm.validationFilteredCount = 0;
		vm.validationSearch = '';

		vm.title = 'Validations';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToValidation = goToValidation;

		vm.paging = {
			currentPage: 1,
            currentPageServer: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.validationFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = ['Integer','String','Date','BeforeDate','AfterDate','Age','CreditCard','Email','Phone','URL','Zip','StartsWithDPT','ContainsDPT']; // Table headers
		vm.sorting = {
			orderBy: 'integer',
			orderDesc: ''
		};
		// #endregion

        // #region server-side remote acess
        
        vm.validationsServer = [];
        vm.validationsServerFilter = [];
        vm.validationCountServer = 0;
        vm.validationFilteredCountServer = 0;
        vm.validationServerSearch = '';
        vm.setValidationsServerFilter = setValidationsServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.validationFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
			orderBy: 'integer',
			orderDesc: ''
		};

      
        // #endregion
		// #endregion

		// 3.3. Run activate method
		activate();

		// #region 3.4. Implement private functions
		function activate() {
			common.activateController([getValidationsServer()

], controllerId)
				.then(function () { log('Activated Validations View.'); });
		}


		function getValidations(forceRefresh) {
			return datacontext.validation.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.validationSearch)
				.then(function (data) {
					vm.validations = data;
					
                    if (!vm.validationCount || forceRefresh) {
						// Only grab the full count once or on refresh
						getValidationCount();
					}
					getValidationFilteredCount();
					return data;
				}
			);
		}

		function getValidationsServer(forceRefresh) {
            return datacontext.validation.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.validationServerSearch)
                .then(function(data) {
                    vm.validationsServerFilter = data;

                    if (!vm.validationFilteredCountServer || forceRefresh) {
                        getValidationCountServer();
                    }

                    getValidationFilteredCountServer();

                    return data;
                });
        }

		// #region Get Counts
		function getValidationCount() {
			return datacontext.validation.getCount().then(function (data) {
				return vm.validationCount = data;
			});
		}

		function getValidationFilteredCount() {
            vm.validationFilteredCount = datacontext.validation.getFilteredCount(vm.validationSearch);
		}

		function getValidationCountServer() {
            return datacontext.validation.getCount().then(function (data) {
                return vm.validationCountServer = data;
            });
        }

        function getValidationFilteredCountServer() {
            datacontext.validation.getFilteredCountServer(vm.validationServerSearch)
                .then(function(count) {
                    vm.validationFilteredCountServer = count;
                });
        }
		// #endregion

		// #region Paging/Sorting/Filtering
		function pageChanged() {
			getValidations();
		}

		function pageChangedServer() {
            getValidationsServer();
        }

		function refresh() { getValidations(true); }
		function refreshServer() { getValidationsServer(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.validationSearch = ''; }
			getValidations();
		}

		function searchServer() {
            return getValidationsServer();
        }

        function setValidationsServerFilter(validation) {
            var textContains = common.textContains;
            var searchText = vm.validationsServerSearch;

            var isMatch = searchText
                ? textContains(validation.name, searchText)
                || textContains(validation.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getValidations();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getValidationsServer();
        }
		// #endregion

		function goToValidation(validation) {
			if (validation && validation.validationID) {
				$location.path('/validation/' + validation.validationID);
			}
		}




		// #endregion
	}
	// #endregion
})();

