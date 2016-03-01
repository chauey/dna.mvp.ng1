(function () {
/**
 * @description
 * 
 * App service helps to:
 * - Talk with angular to datacontext to Breeze to get to the back-end
 * - Configure Breeze validation options.
 */

    'use strict';
    
    var serviceId = 'entityManagerFactory';
    angular.module('app.services.data').factory(serviceId, ['breeze', 'config', 'model', emFactory]);

    function emFactory(breeze, config, model) {
        // Validate when click save
        // (do not validate when we attach a newly created entity to an EntityManager and when property change.)
        // We could also set this per entityManager
        new breeze.ValidationOptions({ validateOnAttach: false, validateOnPropertyChange: false }).setAsDefault();

        configureBreeze();
        // Config serviceName
        var serviceRoot = window.location.protocol + '//' + window.location.host + '/'; //"http://localhost:12483/"
        var serviceName = config.remoteServiceName; // "breeze/Breeze"

        var metadataStore = createMetadataStore();

        var provider = {
            metadataStore: metadataStore,
            newManager: newManager,
            serviceRoot: serviceRoot,
            serviceName: serviceName
        };
        
        return provider;

        function configureBreeze() {
            // use Web API OData to query and save
            breeze.config.initializeAdapterInstance('dataService', 'OData', true);

            // convert between server-side PacalCase and client-side camelCase
            breeze.NamingConvention.camelCase.setAsDefault();
        }

        function createMetadataStore() {
            var store = new breeze.MetadataStore();
            model.configureMetadataStore(store);
            return store;
        }

        function newManager() {
            var mgr = new breeze.EntityManager(
                {
                    serviceName: serviceName,
                    metadataStore: metadataStore
                });
            return mgr;
        }
    }
})();