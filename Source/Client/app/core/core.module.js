(function () {
    'use strict';

    angular.module('app.core', [
        // Angular modules 
        'ngAnimate',            // animations
        'ngSanitize',           // sanitizes html bindings (ex: sidebar.js)
        'ngMessages',           // display validation messages
        'LocalStorageModule',   // Angular Local Storage
        'ngTouch',              // Angular Touch support

         // Custom modules 
        'common',               // common functions, logger, spinner
        'common.bootstrap',     // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'breeze.angular',       // configures breeze for an angular app
        'breeze.directives',    // contains the breeze validation directive (zValidate)
        'ngzWip',               // Angular-Breeze LocalStorage features
    ]);
})();