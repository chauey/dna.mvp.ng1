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
