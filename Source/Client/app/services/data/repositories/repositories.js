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