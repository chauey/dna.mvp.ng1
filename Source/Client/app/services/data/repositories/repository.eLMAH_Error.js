
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


