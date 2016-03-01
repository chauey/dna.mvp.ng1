(function () {
/**
 * @description
 * 
 * App service to update current URL when a new entity is saved.
 * (get the id of entity, then replace URL from {entityItem}/new to {entityItem}/id).
 */

    'use strict';

    var serviceId = 'urlHelper';

    angular.module('app.blocks').factory(serviceId, ['$location', 'common', helper]);

    function helper($location, common) {
        var service = {
            replaceLocationUrlGuidWithId: replaceLocationUrlGuidWithId
        };

        return service;

        function replaceLocationUrlGuidWithId(id) {
            // If the current Url is a Guid, then we replace 
            // it with the passed in id. Otherwise, we exit.
            var currentPath = $location.path();
            var slashPos = currentPath.lastIndexOf('/', currentPath.length - 2);
            var currentParameter = currentPath.substring(slashPos - 1);
            if (common.isNumber(currentParameter)) { return; }

            var newPath = currentPath.substring(0, slashPos + 1) + id;
            $location.path(newPath);
        }

    }
})();