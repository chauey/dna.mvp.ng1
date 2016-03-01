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
            //return EntityQuery.from('Lookups')
            //    .using(self.manager).execute()
            //    .then(querySucceeded, self._queryFailed);

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