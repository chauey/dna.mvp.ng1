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