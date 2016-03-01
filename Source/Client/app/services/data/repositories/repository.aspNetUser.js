
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


