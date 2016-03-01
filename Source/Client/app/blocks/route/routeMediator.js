(function () {
/**
 * @description
 * 
 * App service to:
 * - Handle error on routing.
 * - Update document title on route change success.
 */

    'use strict';

    var serviceId = 'routeMediator';

    angular.module('app.blocks').factory(serviceId,
        ['$state', '$rootScope', 'config', 'logger', routeMediator]);

    function routeMediator($state, $rootScope, config, logger) {
        var handleRouteChangeError = true;
        var service = {
            setRoutingHandlers: setRoutingHandlers
        };

        return service;

        function setRoutingHandlers() {
            updateDocTitle();
            handleRoutingErrors();
        }

        function handleRoutingErrors() {
            $rootScope.$on('$stateChangeError',
                function (event, current, previous, rejection) {
                    if (handleRouteChangeError) { return; }
                    handleRouteChangeError = true;
                    var msg = 'Error routing: ' + (current && current.name)
                        + '. ' + (rejection.msg || '');
                    logger.logWarning(msg, current, serviceId, true);
                    $state.go('/');
                });
        }

        function updateDocTitle() {
            $rootScope.$on('$stateChangeSuccess',
                function (event, current, previous) {
                    handleRouteChangeError = false;
                    var title = config.docTitle + (current.label || current.name || '');
                    $rootScope.title = title;
                }
            );
        }

    }
})();