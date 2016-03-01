// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'userAspNetRolesListService';

    // 1. Add controller to module
    angular
		.module('app.features')
		.service(controllerId, userAspNetRolesListService);

    // 2. Inject dependencies
    userAspNetRolesListService.$inject = ['$location', 'common', 'config', 'datacontext'];

    // 3. Define controller
    function userAspNetRolesListService($location, common, config, datacontext) {
        var that = this;
        // #region 3.1. Setup variables and functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        // #endregion

        // #region 3.2. Expose public bindable interface
        // #region Breeze client-side cached
        this.aspNetRoles = [];
        this.aspNetRoleCount = 0;
        this.aspNetRoleFilteredCount = 0;
        this.aspNetRoleSearch = '';
        this.selectedRole = null;

        this.title = 'AspNetRoles';
        this.refresh = refresh;
        this.search = search;

        this.paging = {
            currentPage: 1,
            currentPageServer: 1,
            maxPagesToShow: 5,
            pageSize: 15
        };
        this.pageChanged = pageChanged;
        Object.defineProperty(this.paging, 'pageCount', {
            get: function () {
                return Math.floor(that.aspNetRoleFilteredCount / this.paging.pageSize) + 1;
            }
        });

        this.setSort = setSort;
        this.theads = ['Name']; // Table headers
        this.sorting = {
            orderBy: 'name',
            orderDesc: ''
        };
        // #endregion

        // #region server-side remote acess

        this.aspNetRolesServer = [];
        this.aspNetRolesServerFilter = [];
        this.aspNetRoleCountServer = 0;
        this.aspNetRoleFilteredCountServer = 0;
        this.aspNetRoleServerSearch = '';
        this.setAspNetRolesServerFilter = setAspNetRolesServerFilter;

        this.refreshServer = refreshServer;
        this.searchServer = searchServer;

        this.pageChangedServer = pageChangedServer;
        Object.defineProperty(this.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(that.aspNetRoleFilteredCountServer / that.paging.pageSize) + 1;
            }
        });

        this.setSortServer = setSortServer;
        this.sortingServer = {
            orderBy: 'name',
            orderDesc: ''
        };

        // #endregion
        // #endregion

        // Populate list
        this.populateList = populateList;
        function populateList(list) {
            that.aspNetRoles = list;
            if (list) {
                that.selectedRole = list[0];
            }
        }
        // 3.3. Run activate method
        //activate();

        // #region 3.4. Implement private functions
        function activate() {
            common.activateController([getAspNetRoles()
                                       , getAspNetRolesServer()], controllerId)
				.then(function () { log('Activated AspNetRoles View.'); });
        }

        function getAspNetRoles(forceRefresh) {
            return datacontext.aspNetRole.getAll(
                    forceRefresh,
                    that.sorting.orderBy,
                    that.sorting.orderDesc,
				    that.paging.currentPage,
                    that.paging.pageSize,
                    that.aspNetRoleSearch)
				.then(function (data) {
				    that.aspNetRoles = data;

				    if (!that.aspNetRoleCount || forceRefresh) {
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
                    that.sortingServer.orderBy,
                    that.sortingServer.orderDesc,
                    that.paging.currentPageServer,
                    that.paging.pageSize,
                    that.aspNetRoleServerSearch)
                .then(function (data) {
                    that.aspNetRolesServerFilter = data;

                    if (!that.aspNetRoleFilteredCountServer || forceRefresh) {
                        getAspNetRoleCountServer();
                    }

                    getAspNetRoleFilteredCountServer();

                    return data;
                });
        }

        // #region Get Counts
        function getAspNetRoleCount() {
            return datacontext.aspNetRole.getCount().then(function (data) {
                return that.aspNetRoleCount = data;
            });
        }

        function getAspNetRoleFilteredCount() {
            that.aspNetRoleFilteredCount = datacontext.aspNetRole.getFilteredCount(that.aspNetRoleSearch);
        }

        function getAspNetRoleCountServer() {
            return datacontext.aspNetRole.getCount().then(function (data) {
                return that.aspNetRoleCountServer = data;
            });
        }

        function getAspNetRoleFilteredCountServer() {
            datacontext.aspNetRole.getFilteredCountServer(that.aspNetRoleServerSearch)
                .then(function (count) {
                    that.aspNetRoleFilteredCountServer = count;
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
            if ($event.keyCode === keyCodes.esc) { that.aspNetRoleSearch = ''; }
            getAspNetRoles();
        }

        function searchServer() {
            return getAspNetRolesServer();
        }

        function setAspNetRolesServerFilter(aspNetRole) {
            var textContains = common.textContains;
            var searchText = that.aspNetRolesServerSearch;

            var isMatch = searchText
                ? textContains(aspNetRole.name, searchText)
                || textContains(aspNetRole.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            that.sorting.orderBy = field;
            if (that.sorting.orderDesc == '') { that.sorting.orderDesc = 'desc'; }
            else { that.sorting.orderDesc = ''; }

            getAspNetRoles();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            that.sortingServer.orderBy = field;
            if (that.sortingServer.orderDesc == '') { that.sortingServer.orderDesc = 'desc'; }
            else { that.sortingServer.orderDesc = ''; }

            return getAspNetRolesServer();
        }
        // #endregion
        // #endregion
    }
    // #endregion
})();

