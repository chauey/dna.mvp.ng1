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


