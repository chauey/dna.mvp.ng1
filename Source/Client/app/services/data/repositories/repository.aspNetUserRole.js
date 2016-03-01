
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


