(function () {
/**
 * @description
 * 
 * Repository service to:
 * - Initialize a collection of repositories from datacontext.js.
 * - Set repository when calling datacontext.{entityName}.{function}...
 */

    'use strict';

    var serviceId = 'repositories';

    angular.module('app.services.data').factory(serviceId, ['$injector', repositories]);

    function repositories($injector) {
        var manager;
        var service = {
            getRepo: getRepo,
            init: init
        };

        return service;

        // Called exclusively by datacontext
        function init(mgr) { manager = mgr; }

        // Get named Repository Ctor (by injection),
        // new it, and initialize it
        function getRepo(repoName) {
            //var fullRepoName = 'repository.' + repoName.toLowerCase();
            var fullRepoName = 'repository.' + repoName;
            var Repo = $injector.get(fullRepoName);
            return new Repo(manager);
        }
    }
})();
(function () {
    /**
     * @description
     * 
     * Repository service that defines shared/generic functions/features for all repositories.
     */

    'use strict';

    var serviceId = 'repository.abstract';

    angular.module('app.services.data').factory(serviceId, ['$q', 'common', 'config', AbstractRepository]);

    function AbstractRepository($q, common, config) {
        var EntityQuery = breeze.EntityQuery;
        var logError = common.logger.getLogFn(this.serviceId, 'error', 'config');

        // Abstract repo gets its derived object's this.manager
        function Ctor() {
            this.isLoaded = false;
        }

        Ctor.extend = function (repoCtor) {
            // Allow this repo to have access to the Abstract Repo's functions,
            // then put its own Ctor back on itself.
            // See http://stackoverflow.com/questions/8453887/why-is-it-necessary-to-set-the-prototype-constructor
            repoCtor.prototype = new Ctor();
            repoCtor.prototype.constructor = repoCtor;
        };

        // Shared functions by repository classes 
        Ctor.prototype.getEntityByIdOrFromWip = getEntityByIdOrFromWip;
        Ctor.prototype._getAllLocal = _getAllLocal;
        Ctor.prototype._getById = _getById;
        Ctor.prototype._getInlineCount = _getInlineCount;
        Ctor.prototype._getLocalEntityCount = _getLocalEntityCount;
        Ctor.prototype._queryFailed = _queryFailed;
        // Convenience functions for the Repos
        Ctor.prototype.log = common.logger.getLogFn(this.serviceId);
        Ctor.prototype.$q = common.$q;

        return Ctor;

        //#region Get Data
        function getEntityByIdOrFromWip(val, forceServer) {
            var wipEntityKey = val;
            var zStorageWip = this.zStorageWip;
            var returnedEntity;

            // PSEUDOCODE:
            // 2 situations when getting an Entity: from Wip table (pass in Wip Key)
            // or from entity list table (pass in entity ID).
            // from Wip: return entity with Wip.
            // from entity list table: check if there are wip(s) for that entity:
            // if yes, return entity with wip (from browser storage).
            // else, return entity without wip (from Breeze).
            // Note: Breeze local storage and Browser (local) storage don't have any relations

            // First, check if from Wip table, then return
            returnedEntity = getWipFromLocalStorage();
            if (!returnedEntity) {
                // Else, from entity list table
                wipEntityKey = zStorageWip.findWipKeyByEntityId(this.entityName, wipEntityKey);

                // Check if there are wip(s) for that entity
                if (!wipEntityKey || forceServer) {

                    // Return entity without wip from Breeze.
                    returnedEntity = this._getById(this.entityName, val);
                } else {
                    returnedEntity = getWipFromLocalStorage();

                    // Return entity with wip.
                    if (returnedEntity) { return returnedEntity; }
                    else {
                        // If not found from wip and breeze, return error
                        return $q.reject({ error: 'Couldn\'t find entity for WIP key ' + wipEntityKey });
                    }
                }
            }

            return returnedEntity;

            // Get Wip from BROWSER's local storage
            function getWipFromLocalStorage() {
                var importedEntity = zStorageWip.loadWipEntity(wipEntityKey);
                if (importedEntity) {
                    // Need to re-validate the entity we are re-hydrating
                    importedEntity.entityAspect.validateEntity();

                    return $q.when({ entity: importedEntity, key: wipEntityKey });
                }
            }
        }

        function _getAllLocal(resource, ordering, predicate) {
            return EntityQuery.from(resource)
                .orderBy(ordering)
                .where(predicate)
                .using(this.manager)
                .executeLocally();
        }

        function _getById(entityName, id, forceRemote) {
            var self = this;
            var manager = self.manager;

            if (!forceRemote) {
                // Check cache first
                var entity = manager.getEntityByKey(entityName, id);

                if (entity) {
                    if (entity.name) {
                        self.log('Retrieved [' + entityName + '] ' + entity.name + ' from cache.', entity, true);
                    } else {
                        var displayName;

                        // Find entity if has name property to display in toastr message (ignore $* properties)
                        for (var property in entity) {
                            if ((property.indexOf('name') > -1) || (property.indexOf('Name') > -1)
                                && (property.indexOf('$') < 0)) {
                                displayName = entity[property];
                            }
                        }

                        // Display 'name' property
                        if (displayName != null) {
                            self.log('Retrieved [' + entityName + '] ' + displayName + ' from cache.', entity, true);
                        } else {

                            // Display ID if can't find a property with 'name' or "Name"
                            self.log('Retrieved [' + entityName + '] id: ' + id + ' from cache.', entity, true);
                        }
                    }

                    if (entity.entityAspect.entityState.isDeleted()) {
                        entity = null; // Hide entity marked-for-delete
                    }

                    return $q.when(entity);
                }
            }

            // Not found in cache, so let's query for it.
            return manager.fetchEntityByKey(entityName, id)
                .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                entity = data.entity;

                if (!entity) {
                    self.log('Could not find [' + entityName + '] id: ' + id + '.', null, true);
                    return null;
                }

                self.log('Retrieved [' + entityName + '] id ' + entity.id
                    + ' from remote data source.', entity, true);

                self.zStorage.save();
                return entity;
            }
        }
        //#endregion

        //#region Get Counts
        function _getLocalEntityCount(resource) {
            var entities = EntityQuery.from(resource)
                .using(this.manager)
                .executeLocally();

            return entities.length;
        }

        function _getInlineCount(data) { return data.inlineCount; }
        //#endregion

        function _queryFailed(error) {
            if (error.status != 401) {
                var msg = config.appErrorPrefix + 'Error retrieving data. ' + error.message;
                logError(msg, error);
                throw error;
            }
        }
    }
})();


 
 






(function () {
    'use strict';

    var serviceId = 'repository.accessControlListItem';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryAccessControlListItem]);

    function RepositoryAccessControlListItem(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.accessControlListItem;
        var controllerName = model.controllerNames.accessControlListItem;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;


	            // get by relative ID
            this.getAllByDomainObjectId = getAllByDomainObjectId ;
               this.getAllByRoleId = getAllByRoleId ;
   
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, permissionValueFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var accessControlListItemOrderBy = orderBy;
            if (orderDesc) { accessControlListItemOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('accessControlListItems') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all accessControlListItems to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(accessControlListItemOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('accessControlListItems', true);
                self.zStorage.save();
                self.log('Retrieved [AccessControlListItems] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have AccessControlListItem, Parent Type and Type that have the same Entity Name = 'AccessControlListItem'
                // So when we add Nullos for Parent Type and Type, it will add to AccessControlListItem list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('roleId', 'contains', '[Select a '));

                if (permissionValueFilter) {
                    predicate = predicate.and(_permissionValuePredicate(permissionValueFilter));
                }

                var accessControlListItems = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(accessControlListItemOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return accessControlListItems;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('roleId', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_namePredicate(nameFilter));
            }

            var accessControlListItemOrderByServer = orderBy;
            if (orderDesc) { accessControlListItemOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .orderBy(accessControlListItemOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [AccessControlListItems] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('accessControlListItems') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load accessControlListItems inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount).catch(self._queryFailed);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _permissionValuePredicate('').and(Predicate.not(Predicate.create('roleId', 'contains', '[Select a ')));

                var accessControlListItems = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return accessControlListItems.length;
            }
        }

        function getFilteredCount(permissionValueFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('permissionValue', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _permissionValuePredicate(permissionValueFilter).and(Predicate.not(Predicate.create('roleId', 'contains', '[Select a ')));

            var accessControlListItems = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return accessControlListItems.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = Predicate.not(Predicate.create('roleId', 'contains', '[Select a '));

            if (filter) {
                predicate = Predicate.create(
                    'roleId',
                    'contains',
                    filter
                );
            }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount)
				.catch(self._queryFailed);
        }


        function getAllWithoutPaging(orderBy) {
            
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [AccessControlListItems] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        //#endregion

        function _permissionValuePredicate(filterValue) {
            return Predicate
                .create('roleId', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	             // #region Get by relative ID


        function getAllByDomainObjectId(forceRemote, orderBy, orderDesc, page, size, relativeID) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var accessControlListItemOrderBy = orderBy;
            if (orderDesc) { accessControlListItemOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('accessControlListItems') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all accessControlListItems to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(accessControlListItemOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('accessControlListItems', true);
                self.zStorage.save();
                self.log('Retrieved [AccessControlListItems] from remote data source.', data.results.length, true);

                return getByPage();
            }

            function getByPage() {
                // We have AccessControlListItem, Parent Type and Type that have the same Entity Name = 'AccessControlListItem'
                // So when we add Nullos for Parent Type and Type, it will add to AccessControlListItem list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('roleId', 'contains', '[Select a '));

                if (relativeID) {
                    var predicateRelativeIDSearch = Predicate.create('domainObjectId', 'equals', relativeID);

                    predicate = Predicate.or(
                        predicateRelativeIDSearch
                    );
                }

                var accessControlListItems = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(accessControlListItemOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return accessControlListItems;
            }
        }

   

        function getAllByRoleId(forceRemote, orderBy, orderDesc, page, size, relativeID) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var accessControlListItemOrderBy = orderBy;
            if (orderDesc) { accessControlListItemOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('accessControlListItems') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all accessControlListItems to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(accessControlListItemOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('accessControlListItems', true);
                self.zStorage.save();
                self.log('Retrieved [AccessControlListItems] from remote data source.', data.results.length, true);

                return getByPage();
            }

            function getByPage() {
                // We have AccessControlListItem, Parent Type and Type that have the same Entity Name = 'AccessControlListItem'
                // So when we add Nullos for Parent Type and Type, it will add to AccessControlListItem list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('roleId', 'contains', '[Select a '));

                if (relativeID) {
                    var predicateRelativeIDSearch = Predicate.create('roleId', 'equals', relativeID);

                    predicate = Predicate.or(
                        predicateRelativeIDSearch
                    );
                }

                var accessControlListItems = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(accessControlListItemOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return accessControlListItems;
            }
        }

           // #endregion


        function create() {
            return this.manager.createEntity(entityName, {
                createdDate: new Date(),
                createdBy: '0'
            });
        }
    }
})();



(function () {
/**
 * @description
 * 
 * Repository service for admin view:
 * - Get data.
 */

    'use strict';

    var serviceId = 'repository.admin';

    angular.module('app.services.data').factory(serviceId,
    ['model', 'repository.abstract', RepositoryAdmin]);

    function RepositoryAdmin(model, AbstractRepository) {
        var entityNames = {
            audit: model.entityNames.audit,
            error: model.entityNames.error,
            account: model.entityNames.account,
            //token: model.entityNames.token
        }
        var controllerNames = {
            audit: model.controllerNames.audit,
            error: model.controllerNames.error,
            account: model.controllerNames.account,
            //token: model.controllerNames.token
        }
        var EntityQuery = breeze.EntityQuery;
        //var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityNames = entityNames;
            this.controllerNames = controllerNames;
            this.manager = mgr;
            // Exposed data access functions
            this.getAll = getAll;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
        function getAll(controllerName, forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;
            
            var entityName;
            switch (controllerName.toLowerCase()) {
                case 'account':
                case 'user':
                {
                    controllerName = controllerNames.account;
                    entityName = entityNames.account;
                    break;
                }
                case 'audit':
                {
                    controllerName = controllerNames.audit;
                    entityName = entityNames.audit;
                    break;
                }
                case 'elmah':
                case 'error':
                {
                    controllerName = controllerNames.error;
                    entityName = entityNames.error;
                    break;
                }
                case 'token':
                    controllerName = controllerNames.token;
                    entityName = entityNames.token;
                    break;
            }
            
            return EntityQuery.from(controllerName)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved ' + controllerName + ' from remote data source.', data.results.length, true);
                return data.results;
                //return getByPage();
            }

            function getByPage() {
                var data = EntityQuery.from(controllerName)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();
                
                return data;
            }
        }
    }
})();


(function () {
    'use strict';

    var serviceId = 'repository.allDataType';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryAllDataType]);

    function RepositoryAllDataType(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.allDataType;
        var controllerName = model.controllerNames.allDataType;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;


	            // get by relative ID
            this.getAllByZHierarchyID = getAllByZHierarchyID ;
   
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        // #region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, bigIntFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var allDataTypeOrderBy = orderBy;
            if (orderDesc) { allDataTypeOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('allDataTypes') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all allDataTypes to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(allDataTypeOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('allDataTypes', true);
                self.zStorage.save();
                self.log('Retrieved [AllDataTypes] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have AllDataType, Parent Type and Type that have the same Entity Name = 'AllDataType'
                // So when we add Nullos for Parent Type and Type, it will add to AllDataType list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('bigInt', 'contains', '[Select a '));

                if (bigIntFilter) {
                    predicate = predicate.and(_bigIntPredicate(bigIntFilter));
                }

                var allDataTypes = EntityQuery.from(controllerName)
                    //.where(predicate)
                    .orderBy(allDataTypeOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return allDataTypes;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_namePredicate(nameFilter));
            }

            var allDataTypeOrderByServer = orderBy;
            if (orderDesc) { allDataTypeOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                //.where(predicate)
                .orderBy(allDataTypeOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [AllDataTypes] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        // #endregion

        // #region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('allDataTypes') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load allDataTypes inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount).catch(self._queryFailed);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _bigIntPredicate('').and(Predicate.not(Predicate.create('bigInt', 'contains', '[Select a ')));

                var allDataTypes = EntityQuery.from(controllerName)
                    //.where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return allDataTypes.length;
            }
        }

        function getFilteredCount(bigIntFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('bigInt', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _bigIntPredicate(bigIntFilter).and(Predicate.not(Predicate.create('bigInt', 'contains', '[Select a ')));

            var allDataTypes = EntityQuery.from(controllerName)
                //.where(predicate)
                .using(this.manager)
                .executeLocally();

            return allDataTypes.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

            if (filter) {
                predicate = Predicate.create(
                    'bigInt',
                    'contains',
                    filter
                );
            }

            return EntityQuery.from(controllerName)
                //.where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount)
				.catch(self._queryFailed);
        }


        function getAllWithoutPaging(orderBy) {
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [AllDataTypes] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        // #endregion

        function _bigIntPredicate(filterValue) {
            return Predicate
                .create('bigInt', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	             // #region Get by relative ID


        function getAllByZHierarchyID(forceRemote, orderBy, orderDesc, page, size, relativeID) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var allDataTypeOrderBy = orderBy;
            if (orderDesc) { allDataTypeOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('allDataTypes') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all allDataTypes to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(allDataTypeOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('allDataTypes', true);
                self.zStorage.save();
                self.log('Retrieved [AllDataTypes] from remote data source.', data.results.length, true);

                return getByPage();
            }

            function getByPage() {
                // We have AllDataType, Parent Type and Type that have the same Entity Name = 'AllDataType'
                // So when we add Nullos for Parent Type and Type, it will add to AllDataType list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

                if (relativeID) {
                    var predicateRelativeIDSearch = Predicate.create('zHierarchyID', 'equals', relativeID);

                    predicate = Predicate.or(
                        predicateRelativeIDSearch
                    );
                }

                var allDataTypes = EntityQuery.from(controllerName)
                    //.where(predicate)
                    .orderBy(allDataTypeOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return allDataTypes;
            }
        }

           // #endregion


        function create() {
            return this.manager.createEntity(entityName, {

                allDataTypeID: breeze.core.getUuid(),
                createdDate: new Date(),
            });
        }
    }
})();




(function () {
    'use strict';

    var serviceId = 'repository.aspNetRole';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryAspNetRole]);

    function RepositoryAspNetRole(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.aspNetRole;
        var controllerName = model.controllerNames.aspNetRole;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;


	
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var aspNetRoleOrderBy = orderBy;
            if (orderDesc) { aspNetRoleOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('aspNetRoles') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all aspNetRoles to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(aspNetRoleOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('aspNetRoles', true);
                self.zStorage.save();
                self.log('Retrieved [AspNetRoles] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have AspNetRole, Parent Type and Type that have the same Entity Name = 'AspNetRole'
                // So when we add Nullos for Parent Type and Type, it will add to AspNetRole list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

                if (nameFilter) {
                    predicate = predicate.and(_namePredicate(nameFilter));
                }

                var aspNetRoles = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(aspNetRoleOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return aspNetRoles;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_namePredicate(nameFilter));
            }

            var aspNetRoleOrderByServer = orderBy;
            if (orderDesc) { aspNetRoleOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .orderBy(aspNetRoleOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [AspNetRoles] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('aspNetRoles') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load aspNetRoles inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount).catch(self._queryFailed);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _namePredicate('').and(Predicate.not(Predicate.create('name', 'contains', '[Select a ')));

                var aspNetRoles = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return aspNetRoles.length;
            }
        }

        function getFilteredCount(nameFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _namePredicate(nameFilter).and(Predicate.not(Predicate.create('name', 'contains', '[Select a ')));

            var aspNetRoles = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return aspNetRoles.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (filter) {
                predicate = Predicate.create(
                    'name',
                    'contains',
                    filter
                );
            }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount)
				.catch(self._queryFailed);
        }


        function getAllWithoutPaging(orderBy) {
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [AspNetRoles] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        //#endregion

        function _namePredicate(filterValue) {
            return Predicate
                .create('name', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	        // #endregion


        function create() {
            return this.manager.createEntity(entityName, {
                id: 0,
                createdDate: new Date(),
            });
        }
    }
})();




(function () {
    'use strict';

    var serviceId = 'repository.aspNetUser';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryAspNetUser]);

    function RepositoryAspNetUser(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.aspNetUser;
        var controllerName = model.controllerNames.aspNetUser;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            this.getIdByUserName = getIdByUserName;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;	
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, userNameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var aspNetUserOrderBy = orderBy;
            if (orderDesc) { aspNetUserOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('aspNetUsers') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all aspNetUsers to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(aspNetUserOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('aspNetUsers', true);
                self.zStorage.save();
                self.log('Retrieved [AspNetUsers] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have AspNetUser, Parent Type and Type that have the same Entity Name = 'AspNetUser'
                // So when we add Nullos for Parent Type and Type, it will add to AspNetUser list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('userName', 'contains', '[Select a '));

                if (userNameFilter) {
                    predicate = predicate.and(_userNamePredicate(userNameFilter));
                }

                var aspNetUsers = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(aspNetUserOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return aspNetUsers;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_namePredicate(nameFilter));
            }

            var aspNetUserOrderByServer = orderBy;
            if (orderDesc) { aspNetUserOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .orderBy(aspNetUserOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [AspNetUsers] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        function getIdByUserName(userName) {
            var self = this;

            var predicate = Predicate.create('userName', 'equals', userName);

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(1)
                .select('id, userName')
                .using(self.manager)
                .execute()
				.catch(self._queryFailed);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('aspNetUsers') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load aspNetUsers inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount).catch(self._queryFailed);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _userNamePredicate('').and(Predicate.not(Predicate.create('userName', 'contains', '[Select a ')));

                var aspNetUsers = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return aspNetUsers.length;
            }
        }

        function getFilteredCount(userNameFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('userName', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _userNamePredicate(userNameFilter).and(Predicate.not(Predicate.create('userName', 'contains', '[Select a ')));

            var aspNetUsers = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return aspNetUsers.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

            if (filter) {
                predicate = Predicate.create(
                    'userName',
                    'contains',
                    filter
                );
            }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount)
				.catch(self._queryFailed);
        }


        function getAllWithoutPaging(orderBy) {
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [AspNetUsers] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        //#endregion

        function _userNamePredicate(filterValue) {
            return Predicate
                .create('userName', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	        // #endregion


        function create() {
            return this.manager.createEntity(entityName, {
                createdDate: new Date(),
            });
        }
    }
})();




(function () {
    'use strict';

    var serviceId = 'repository.aspNetUserRole';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryAspNetUserRole]);

    function RepositoryAspNetUserRole(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.aspNetUserRole;
        var controllerName = model.controllerNames.aspNetUserRole;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;


	            // get by relative ID
            this.getAllByUserId = getAllByUserId ;
               this.getAllByRoleId = getAllByRoleId ;
   
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, Filter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var aspNetUserRoleOrderBy = orderBy;
            if (orderDesc) { aspNetUserRoleOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('aspNetUserRoles') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all aspNetUserRoles to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(aspNetUserRoleOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('aspNetUserRoles', true);
                self.zStorage.save();
                self.log('Retrieved [AspNetUserRoles] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have AspNetUserRole, Parent Type and Type that have the same Entity Name = 'AspNetUserRole'
                // So when we add Nullos for Parent Type and Type, it will add to AspNetUserRole list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('', 'contains', '[Select a '));

                if (Filter) {
                    predicate = predicate.and(_Predicate(Filter));
                }

                var aspNetUserRoles = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(aspNetUserRoleOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return aspNetUserRoles;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_namePredicate(nameFilter));
            }

            var aspNetUserRoleOrderByServer = orderBy;
            if (orderDesc) { aspNetUserRoleOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .orderBy(aspNetUserRoleOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [AspNetUserRoles] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('aspNetUserRoles') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load aspNetUserRoles inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount).catch(self._queryFailed);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _Predicate('').and(Predicate.not(Predicate.create('', 'contains', '[Select a ')));

                var aspNetUserRoles = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return aspNetUserRoles.length;
            }
        }

        function getFilteredCount(Filter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _Predicate(Filter).and(Predicate.not(Predicate.create('', 'contains', '[Select a ')));

            var aspNetUserRoles = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return aspNetUserRoles.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

            if (filter) {
                predicate = Predicate.create(
                    '',
                    'contains',
                    filter
                );
            }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount)
				.catch(self._queryFailed);
        }


        function getAllWithoutPaging(orderBy) {
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [AspNetUserRoles] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        //#endregion

        function _Predicate(filterValue) {
            return Predicate
                .create('', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	             // #region Get by relative ID


        function getAllByUserId(forceRemote, orderBy, orderDesc, page, size, relativeID) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var aspNetUserRoleOrderBy = orderBy;
            if (orderDesc) { aspNetUserRoleOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('aspNetUserRoles') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all aspNetUserRoles to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(aspNetUserRoleOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('aspNetUserRoles', true);
                self.zStorage.save();
                self.log('Retrieved [AspNetUserRoles] from remote data source.', data.results.length, true);

                return getByPage();
            }

            function getByPage() {
                // We have AspNetUserRole, Parent Type and Type that have the same Entity Name = 'AspNetUserRole'
                // So when we add Nullos for Parent Type and Type, it will add to AspNetUserRole list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

                if (relativeID) {
                    var predicateRelativeIDSearch = Predicate.create('userId', 'equals', relativeID);

                    predicate = Predicate.or(
                        predicateRelativeIDSearch
                    );
                }

                var aspNetUserRoles = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(aspNetUserRoleOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return aspNetUserRoles;
            }
        }

   

        function getAllByRoleId(forceRemote, orderBy, orderDesc, page, size, relativeID) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var aspNetUserRoleOrderBy = orderBy;
            if (orderDesc) { aspNetUserRoleOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('aspNetUserRoles') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all aspNetUserRoles to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(aspNetUserRoleOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('aspNetUserRoles', true);
                self.zStorage.save();
                self.log('Retrieved [AspNetUserRoles] from remote data source.', data.results.length, true);

                return getByPage();
            }

            function getByPage() {
                // We have AspNetUserRole, Parent Type and Type that have the same Entity Name = 'AspNetUserRole'
                // So when we add Nullos for Parent Type and Type, it will add to AspNetUserRole list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

                if (relativeID) {
                    var predicateRelativeIDSearch = Predicate.create('roleId', 'equals', relativeID);

                    predicate = Predicate.or(
                        predicateRelativeIDSearch
                    );
                }

                var aspNetUserRoles = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(aspNetUserRoleOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return aspNetUserRoles;
            }
        }

           // #endregion


        function create() {
            return this.manager.createEntity(entityName, {
                createdDate: new Date(),
            });
        }
    }
})();



(function () {
/**
 * @description
 * 
 * Repository service for attachment (file upload) view:
 * - Get data.
 * - Create new entities.
 */

    'use strict';

    var serviceId = 'repository.attachment';

    angular.module('app.services.data').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryAttachment]);

    function RepositoryAttachment(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.attachment;
        var controllerName = model.controllerNames.attachment;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            // Exposed data access functions
            this.create = create;
            this.getAll = getAll;
            this.getAllTest = getAllTest;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, fileNameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var attachmentOrderBy = orderBy;
            if (orderDesc) { attachmentOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('attachments') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all attachments to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(attachmentOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('attachments', true);
                self.zStorage.save();
                self.log('Retrieved [Attachments] from remote data source.', data.results.length, true);

                return getByPage();
            }

            function getByPage() {
                // We have Attachment, Parent Type and Type that have the same Entity Name = 'Attachment'
                // So when we add Nullos for Parent Type and Type, it will add to Attachment list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('fileName', 'contains', '[Select a '));

                if (fileNameFilter) {
                    predicate = predicate.and(_fileNamePredicate(fileNameFilter));
                }

                var attachments = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(attachmentOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return attachments;
            }
        }

        //#region Get Data
        function getAllTest(forceRemote, page, size, fileNameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;
            
            // Check cache first
            if (self.zStorage.areItemsLoaded('attachments') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all attachments to cache via remote query
            return EntityQuery.from(controllerName)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('attachments', true);
                self.zStorage.save();
                self.log('Retrieved [Attachments] from remote data source.', data.results.length, true);

                return getByPage();
            }

            function getByPage() {
                // We have Attachment, Parent Type and Type that have the same Entity Name = 'Attachment'
                // So when we add Nullos for Parent Type and Type, it will add to Attachment list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('fileName', 'contains', '[Select a '));

                if (fileNameFilter) {
                    predicate = predicate.and(_fileNamePredicate(fileNameFilter));
                }

                var attachments = EntityQuery.from(controllerName)
                    .where(predicate)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return attachments;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('attachments') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load attachments inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _fileNamePredicate('').and(Predicate.not(Predicate.create('fileName', 'contains', '[Select a ')));

                var attachments = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return attachments.length;
            }
        }

        function getFilteredCount(fileNameFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('fileName', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _fileNamePredicate(fileNameFilter).and(Predicate.not(Predicate.create('fileName', 'contains', '[Select a ')));

            var attachments = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return attachments.length;
        }
        //#endregion

        function _fileNamePredicate(filterValue) {
            return Predicate
                .create('fileName', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }

        function create() {
            return this.manager.createEntity(entityName, {
                attachmentID: breeze.core.getUuid(),
                createdDate: new Date(),
				// init dropdowns
                //parentID: '11111111-1111-1111-1111-111111111111',
                //typeID: '00000000-0000-0000-0000-000000000000'
            });
        }
    }
})();




(function () {
    'use strict';

    var serviceId = 'repository.auditLog';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryAuditLog]);

    function RepositoryAuditLog(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.auditLog;
        var controllerName = model.controllerNames.auditLog;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;


	
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, tableNameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var auditLogOrderBy = orderBy;
            if (orderDesc) { auditLogOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('auditLog') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all auditLog to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(auditLogOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('auditLog', true);
                self.zStorage.save();
                self.log('Retrieved [AuditLog] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have AuditLog, Parent Type and Type that have the same Entity Name = 'AuditLog'
                // So when we add Nullos for Parent Type and Type, it will add to AuditLog list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('tableName', 'contains', '[Select a '));

                if (tableNameFilter) {
                    predicate = predicate.and(_tableNamePredicate(tableNameFilter));
                }

                var auditLog = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(auditLogOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return auditLog;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_namePredicate(nameFilter));
            }

            var auditLogOrderByServer = orderBy;
            if (orderDesc) { auditLogOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .orderBy(auditLogOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [AuditLog] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('auditLog') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load auditLog inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount).catch(self._queryFailed);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _tableNamePredicate('').and(Predicate.not(Predicate.create('tableName', 'contains', '[Select a ')));

                var auditLog = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return auditLog.length;
            }
        }

        function getFilteredCount(tableNameFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('tableName', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _tableNamePredicate(tableNameFilter).and(Predicate.not(Predicate.create('tableName', 'contains', '[Select a ')));

            var auditLog = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return auditLog.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

            if (filter) {
                predicate = Predicate.create(
                    'tableName',
                    'contains',
                    filter
                );
            }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount)
				.catch(self._queryFailed);
        }


        function getAllWithoutPaging(orderBy) {
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [AuditLog] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        //#endregion

        function _tableNamePredicate(filterValue) {
            return Predicate
                .create('tableName', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	        // #endregion


        function create() {
            return this.manager.createEntity(entityName, {
                createdDate: new Date(),
            });
        }
    }
})();




(function () {
    'use strict';

    var serviceId = 'repository.domainObject';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', '$http', '$rootScope', RepositoryDomainObject]);

    function RepositoryDomainObject(model, AbstractRepository, zStorage, zStorageWip, $http, $rootScope) {
        var entityName = model.entityNames.domainObject;
        var controllerName = model.controllerNames.domainObject;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;
            this.getAllAccessControlListAndPermissions = getAllAccessControlListAndPermissions;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var domainObjectOrderBy = orderBy;
            if (orderDesc) { domainObjectOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('domainObjects') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all domainObjects to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(domainObjectOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('domainObjects', true);
                self.zStorage.save();
                self.log('Retrieved [DomainObjects] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have DomainObject, Parent Type and Type that have the same Entity Name = 'DomainObject'
                // So when we add Nullos for Parent Type and Type, it will add to DomainObject list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

                if (nameFilter) {
                    predicate = predicate.and(_namePredicate(nameFilter));
                }

                var domainObjects = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(domainObjectOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return domainObjects;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_namePredicate(nameFilter));
            }

            var domainObjectOrderByServer = orderBy;
            if (orderDesc) { domainObjectOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .orderBy(domainObjectOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [DomainObjects] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        function getAllAccessControlListAndPermissions(orderBy, orderDesc) {
            var self = this;

            var domainObjectOrderBy = orderBy;
            if (orderDesc) { domainObjectOrderBy = orderBy + ' ' + orderDesc; }

            var serviceRoot = window.location.protocol + '//' + window.location.host + '/',
                remoteServiceName = 'breeze/AngularProjectBaseBreeze/';

            //return $http.get(serviceRoot + remoteServiceName + "DomainObjectsByRoleId")
            return $http.get(serviceRoot + remoteServiceName + "GetAllAccessControlListAndPermissions")
            .then(function (result) {
                $rootScope.accessControlList = result.data.accessControlList;
                $rootScope.permissions = result.data.permissions;

                return result.data.accessControlList;
            });
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('domainObjects') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load domainObjects inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount).catch(self._queryFailed);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _namePredicate('').and(Predicate.not(Predicate.create('name', 'contains', '[Select a ')));

                var domainObjects = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return domainObjects.length;
            }
        }

        function getFilteredCount(nameFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _namePredicate(nameFilter).and(Predicate.not(Predicate.create('name', 'contains', '[Select a ')));

            var domainObjects = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return domainObjects.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (filter) {
                predicate = Predicate.create(
                    'name',
                    'contains',
                    filter
                );
            }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount)
				.catch(self._queryFailed);
        }


        function getAllWithoutPaging(orderBy) {
            
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [DomainObjects] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        //#endregion

        function _namePredicate(filterValue) {
            return Predicate
                .create('name', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	        // #endregion


        function create() {
            return this.manager.createEntity(entityName, {
                createdDate: new Date(),
            });
        }
    }
})();




(function () {
    'use strict';

    var serviceId = 'repository.eLMAH_Error';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryELMAH_Error]);

    function RepositoryELMAH_Error(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.eLMAH_Error;
        var controllerName = model.controllerNames.eLMAH_Error;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;


	
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, applicationFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var eLMAH_ErrorOrderBy = orderBy;
            if (orderDesc) { eLMAH_ErrorOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('eLMAH_Error') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all eLMAH_Error to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(eLMAH_ErrorOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('eLMAH_Error', true);
                self.zStorage.save();
                self.log('Retrieved [ELMAH_Error] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have ELMAH_Error, Parent Type and Type that have the same Entity Name = 'ELMAH_Error'
                // So when we add Nullos for Parent Type and Type, it will add to ELMAH_Error list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('application', 'contains', '[Select a '));

                if (applicationFilter) {
                    predicate = predicate.and(_applicationPredicate(applicationFilter));
                }

                var eLMAH_Error = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(eLMAH_ErrorOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return eLMAH_Error;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_namePredicate(nameFilter));
            }

            var eLMAH_ErrorOrderByServer = orderBy;
            if (orderDesc) { eLMAH_ErrorOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .orderBy(eLMAH_ErrorOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [ELMAH_Error] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('eLMAH_Error') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load eLMAH_Error inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount).catch(self._queryFailed);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _applicationPredicate('').and(Predicate.not(Predicate.create('application', 'contains', '[Select a ')));

                var eLMAH_Error = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return eLMAH_Error.length;
            }
        }

        function getFilteredCount(applicationFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('application', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _applicationPredicate(applicationFilter).and(Predicate.not(Predicate.create('application', 'contains', '[Select a ')));

            var eLMAH_Error = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return eLMAH_Error.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

            if (filter) {
                predicate = Predicate.create(
                    'application',
                    'contains',
                    filter
                );
            }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount)
				.catch(self._queryFailed);
        }


        function getAllWithoutPaging(orderBy) {
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [ELMAH_Error] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        //#endregion

        function _applicationPredicate(filterValue) {
            return Predicate
                .create('application', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	        // #endregion


        function create() {
            return this.manager.createEntity(entityName, {

                eLMAH_ErrorID: breeze.core.getUuid(),
                createdDate: new Date(),
            });
        }
    }
})();



(function () {
/**
 * @description
 * 
 * Repository service for dropdowns:
 * - Get data.
 * - Set data.
 */

    'use strict';

    var serviceId = 'repository.lookup';

    angular.module('app.services.data').factory(serviceId, ['model', 'repository.abstract', 'zStorage', RepositoryLookup]);

    function RepositoryLookup(model, AbstractRepository, zStorage) {

        var entityName = 'lookups';
        var entityNames = model.entityNames;
        var controllerNames = model.controllerNames;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;
        var parentTypeOfTypes = [];
        var types = [];
        var domainObjects = [];
        var roles = [];
        var permissions = [];

        var statuss = [];
        var govts = [];
        var customers = [];
        var iUsers = [];

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;   
            // Exposed data access functions
            this.getAll = getAll;
            this.setLookups = setLookups;
        }

        // Allow this repo to have access to the Abstract Repo's functions,
        // then put its own Ctor back on itself.
        //Ctor.prototype = new AbstractRepository(Ctor);
        //Ctor.prototype.constructor = Ctor;
        AbstractRepository.extend(Ctor);

        return Ctor;

        function getAll() {
            var self = this;

            // Get other lookup lists
            return EntityQuery.from('Lookups')
                .using(self.manager).execute()
                .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                if (data.results.length > 0) {
                    parentTypeOfTypes = data.results[0].parentTypeOfTypes;
                    types = data.results[0].types;
                    domainObjects = data.results[0].domainObjects;
                    permissions = data.results[0].permissions;
                    roles = data.results[0].roles;
                }

                model.createNullos(self.manager);

                self.zStorage.save();

                self.log('Retrieved [Lookups]', data, true);

                return true;
            }
        }

        function setLookups() {
            this.lookupCachedData = {
                parentTypeOfTypes: parentTypeOfTypes,
                // parentTypeOfTypes: this._getAllLocal(entityNames.lookup, 'parentTypeOfTypes'),
                types: types,
                domainObjects: domainObjects,
                permissions: permissions,
                roles: roles
            };
        }

        function parentTypeOfTypesPredicate() {
            return Predicate.create('parentID', '==', null);
        }
    }
})();

(function () {
    'use strict';

    var serviceId = 'repository.permission';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryPermission]);

    function RepositoryPermission(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.permission;
        var controllerName = model.controllerNames.permission;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;


	
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var permissionOrderBy = orderBy;
            if (orderDesc) { permissionOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('permissions') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all permissions to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(permissionOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('permissions', true);
                self.zStorage.save();
                self.log('Retrieved [Permissions] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have Permission, Parent Type and Type that have the same Entity Name = 'Permission'
                // So when we add Nullos for Parent Type and Type, it will add to Permission list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

                if (nameFilter) {
                    predicate = predicate.and(_namePredicate(nameFilter));
                }

                var permissions = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(permissionOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return permissions;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_namePredicate(nameFilter));
            }

            var permissionOrderByServer = orderBy;
            if (orderDesc) { permissionOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .orderBy(permissionOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [Permissions] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('permissions') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load permissions inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount).catch(self._queryFailed);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _namePredicate('').and(Predicate.not(Predicate.create('name', 'contains', '[Select a ')));

                var permissions = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return permissions.length;
            }
        }

        function getFilteredCount(nameFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _namePredicate(nameFilter).and(Predicate.not(Predicate.create('name', 'contains', '[Select a ')));

            var permissions = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return permissions.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (filter) {
                predicate = Predicate.create(
                    'name',
                    'contains',
                    filter
                );
            }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount)
				.catch(self._queryFailed);
        }


        function getAllWithoutPaging(orderBy) {
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [Permissions] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        //#endregion

        function _namePredicate(filterValue) {
            return Predicate
                .create('name', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	        // #endregion


        function create() {
            return this.manager.createEntity(entityName, {
                createdDate: new Date(),
            });
        }
    }
})();




(function () {
    'use strict';

    var serviceId = 'repository.typeOfType';

    angular.module('app').factory(serviceId,
        ['$http', 'model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryTypeOfType]);

    function RepositoryTypeOfType($http, model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.typeOfType;
        var controllerName = model.controllerNames.typeOfType;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.create_Validation = create_Validation;
            this.getById_Validation = getById_Validation;
            this.getById_ValidationNG = getById_ValidationNG;

            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;


	            // get by relative ID
            this.getAllByParentID = getAllByParentID ;
               this.getAllByTypeID = getAllByTypeID ;
   
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var typeOfTypeOrderBy = orderBy;
            if (orderDesc) { typeOfTypeOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('typeOfTypes') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all typeOfTypes to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(typeOfTypeOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('typeOfTypes', true);
                self.zStorage.save();
                self.log('Retrieved [TypeOfTypes] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have TypeOfType, Parent Type and Type that have the same Entity Name = 'TypeOfType'
                // So when we add Nullos for Parent Type and Type, it will add to TypeOfType list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

                if (nameFilter) {
                    predicate = predicate.and(_namePredicate(nameFilter));
                }

                var typeOfTypes = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(typeOfTypeOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return typeOfTypes;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('name', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_namePredicate(nameFilter));
            }

            var typeOfTypeOrderByServer = orderBy;
            if (orderDesc) { typeOfTypeOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .orderBy(typeOfTypeOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [TypeOfTypes] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('typeOfTypes') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load typeOfTypes inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _namePredicate('').and(Predicate.not(Predicate.create('name', 'contains', '[Select a ')));

                var typeOfTypes = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return typeOfTypes.length;
            }
        }

        function getFilteredCount(nameFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _namePredicate(nameFilter).and(Predicate.not(Predicate.create('name', 'contains', '[Select a ')));

            var typeOfTypes = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return typeOfTypes.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

            if (filter) {
                predicate = Predicate.create(
                    'name',
                    'contains',
                    filter
                );
            }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount);
        }


        function getAllWithoutPaging(orderBy) {
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [TypeOfTypes] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        //#endregion

        function _namePredicate(filterValue) {
            return Predicate
                .create('name', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	             // #region Get by relative ID


        function getAllByParentID(forceRemote, orderBy, orderDesc, page, size, relativeID) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var typeOfTypeOrderBy = orderBy;
            if (orderDesc) { typeOfTypeOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('typeOfTypes') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all typeOfTypes to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(typeOfTypeOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('typeOfTypes', true);
                self.zStorage.save();
                self.log('Retrieved [TypeOfTypes] from remote data source.', data.results.length, true);

                return getByPage();
            }

            function getByPage() {
                // We have TypeOfType, Parent Type and Type that have the same Entity Name = 'TypeOfType'
                // So when we add Nullos for Parent Type and Type, it will add to TypeOfType list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

                if (relativeID) {
                    var predicateRelativeIDSearch = Predicate.create('parentID', 'equals', relativeID);

                    predicate = Predicate.or(
                        predicateRelativeIDSearch
                    );
                }

                var typeOfTypes = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(typeOfTypeOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return typeOfTypes;
            }
        }

   

        function getAllByTypeID(forceRemote, orderBy, orderDesc, page, size, relativeID) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var typeOfTypeOrderBy = orderBy;
            if (orderDesc) { typeOfTypeOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('typeOfTypes') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all typeOfTypes to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(typeOfTypeOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('typeOfTypes', true);
                self.zStorage.save();
                self.log('Retrieved [TypeOfTypes] from remote data source.', data.results.length, true);

                return getByPage();
            }

            function getByPage() {
                // We have TypeOfType, Parent Type and Type that have the same Entity Name = 'TypeOfType'
                // So when we add Nullos for Parent Type and Type, it will add to TypeOfType list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('code', 'contains', '[Select a '));

                if (relativeID) {
                    var predicateRelativeIDSearch = Predicate.create('typeID', 'equals', relativeID);

                    predicate = Predicate.or(
                        predicateRelativeIDSearch
                    );
                }

                var typeOfTypes = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(typeOfTypeOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return typeOfTypes;
            }
        }

           // #endregion


        function create() {
            return this.manager.createEntity(entityName, {
                typeOfTypeID: breeze.core.getUuid(),
                createdDate: new Date(),
                parentID: common.emptyGuid,
                typeID: common.emptyGuid
            });
        }

        // Temporary for testing
        function create_Validation() {
            return this.manager.createEntity('Validation', { validationID: breeze.core.getUuid() });
        }

        function getById_Validation(id, forceRemote) {
            return this._getById('Validation', id, forceRemote);
        }

        // Get by HTTP GET request in order to not touch Breeze
        function getById_ValidationNG(id, forceRemote) {
            var serviceRoot = window.location.protocol + '//' + window.location.host + '/',
                remoteServiceName = 'breeze/AngularProjectBaseBreeze/';

            return $http.get(serviceRoot + remoteServiceName + "Validations" + "?$filter=ValidationID%20eq%20guid%27" + id + "%27")
            .then(function (result) {
                return result.data;
            });
        }
    }
})();




(function () {
    'use strict';

    var serviceId = 'repository.user';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryUser]);

    function RepositoryUser(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.user;
        var controllerName = model.controllerNames.user;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            
            // Exposed data access functions
            // Client-side
            this.create = create;
            this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAll(forceRemote, orderBy, orderDesc, page, size, lastNameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var userOrderBy = orderBy;
            if (orderDesc) { userOrderBy = orderBy + ' ' + orderDesc; }

            // Check cache first
            if (self.zStorage.areItemsLoaded('users') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            // Load all users to cache via remote query
            return EntityQuery.from(controllerName)
                .orderBy(userOrderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded('users', true);
                self.zStorage.save();
                self.log('Retrieved [Users] from remote data source.', data.results.length, true);

                return getByPage();
            }
            
            function getByPage() {
                // We have User, Parent Type and Type that have the same Entity Name = 'User'
                // So when we add Nullos for Parent Type and Type, it will add to User list automatically
                // This predicate to remove the Nullos which contain '[Select a '
                var predicate = Predicate.not(Predicate.create('lastName', 'contains', '[Select a '));

                if (lastNameFilter) {
                    predicate = predicate.and(_lastNamePredicate(lastNameFilter));
                }

                var users = EntityQuery.from(controllerName)
                    .where(predicate)
                    .orderBy(userOrderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return users;
            }
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            var predicate = Predicate.not(Predicate.create('lastName', 'contains', '[Select a '));

            if (nameFilter) {
                predicate = predicate.and(_lastNamePredicate(nameFilter));
            }

            var userOrderByServer = orderBy;
            if (orderDesc) { userOrderByServer = orderBy + ' ' + orderDesc; }

            return EntityQuery.from(controllerName)
                .where(predicate)
                .orderBy(userOrderByServer)
                .take(take).skip(skip)
                .using(self.manager).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                self.log('Retrieved [Users] from remote data source.', data.results.length, true);
                return data.results;
            }
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            var self = this;
            // Check cache first
            if (self.zStorage.areItemsLoaded('users') && !forceRemote) {
                //return self.$q.when(self._getLocalEntityCount(controllerName));

                // Use getLocalCount instead of self._getLocalEntityCount to remove the Nullos
                return self.$q.when(getLocalCount());
            }

            // Load users inlineCount via remote query
            return EntityQuery.from(controllerName).take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount);

            function getLocalCount() {
                // Add "and" clause to remove the Nullos
                // For more information: please search for 'Predicate.not(Predicate.create('name', 'contains', '[Select a '))'
                // and read the comment above it.
                var predicate = _lastNamePredicate('').and(Predicate.not(Predicate.create('lastName', 'contains', '[Select a ')));

                var users = EntityQuery.from(controllerName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();

                return users.length;
            }
        }

        function getFilteredCount(lastNameFilter) {
            // Add "and" clause to remove the Nullos
            // For more information: please search for 'Predicate.not(Predicate.create('lastName', 'contains', '[Select a '))'
            // and read the comment above it.
            var predicate = _lastNamePredicate(lastNameFilter).and(Predicate.not(Predicate.create('lastName', 'contains', '[Select a ')));

            var users = EntityQuery.from(controllerName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return users.length;
        }

        function getFilteredCountServer(filter) {

            var self = this;

            var predicate = _lastNamePredicate(filter).and(Predicate.not(Predicate.create('lastName', 'contains', '[Select a ')));

            return EntityQuery.from(controllerName)
                .where(predicate)
                .take(0)
                .inlineCount()
                .using(self.manager)
                .execute()
                .then(self._getInlineCount);
        }

        //#endregion

        function _lastNamePredicate(filterValue) {
            return Predicate
                .create('lastName', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }

        function create() {
            return this.manager.createEntity(entityName, {
                userID: breeze.core.getUuid(),
                createdDate: new Date(),
            });
        }
    }
})();



