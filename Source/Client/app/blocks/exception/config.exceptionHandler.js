(function () {
/**
 * @description
 * 
 * Uses some Angular features to extend the exceptionHandler server that's built-in to Angular,
 * so not only it will log errors, but we also use a custom feature to pop-up toastr notifications
 * to show the message (info, success, warning, error).
 * 
 * Send error message to ErrorController in ther server to log error through AJAX call.
 */

    'use strict';
    
    var app = angular.module('app.blocks');

    // Configure by setting an optional string value for appErrorPrefix.
    // Accessible via config.appErrorPrefix (via config value).

    app.config(['$provide', function ($provide) {
        $provide.decorator('$exceptionHandler',
            ['$delegate', 'config', 'logger', extendExceptionHandler]);
    }]);
    
    // Extend the $exceptionHandler service to also display a toast.
    function extendExceptionHandler($delegate, config, logger) {
        var _baseUrl = config.remoteServiceName;
        var appErrorPrefix = config.appErrorPrefix;
        var logError = logger.getLogFn('app', 'error');
        return function (exception, cause) {
            $delegate(exception, cause);
            if (exception.status == 401 || (appErrorPrefix && exception.message && exception.message.indexOf(appErrorPrefix) === 0)) {
                return;
            }

            var errorData = { exception: exception, cause: cause };
            var msg = appErrorPrefix + exception.message;
            
            logError(msg, errorData, true);

            // Send message to ErrorController (Elmah) in the server to log error through ajax call
            var xhr = new XMLHttpRequest();
            debugger
            xhr.open('POST', _baseUrl + '/api/error', true);
            xhr.setRequestHeader("Content-type",
                "application/x-www-form-urlencoded");
            xhr.send(errorData.exception.stack);
        };
    }
})();