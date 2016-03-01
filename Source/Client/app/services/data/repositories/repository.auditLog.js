
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


