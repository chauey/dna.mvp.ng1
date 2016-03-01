/**
 * @description
 * 
 * Place to start with angular:
 * - Creates Angular module called 'app'.
 * - Injects dependencies inside []
 * - Runs start-up code.
 */

//'use strict';

// https://docs.angularjs.org/api/ng/function/angular.module
// ngDocs: The angular.module is a global place for creating, registering and retrieving Angular modules. 
// All modules (angular core or 3rd party) that should be available to an application must be registered using this mechanism.
var app = angular.module('app', [
    // 20141022 update: Restructure and modulization https://github.com/johnpapa/angularjs-styleguide#application-structure-lift-principle
    'app.blocks',                   // Things can copy directly into other projects.
    'app.core',                     // Core modules: Angular, Breeze, custom, 3rd party.
    'app.features',                 // validations, allDataTypes, membership, ...
    'app.layout',                   // shell, topnav, sidebar.
    'app.services.membership',      // Membership services.
    'app.services.stripe',          // Stripe service
    'app.services.data',            // Data services.
    'app.widgets'                   // Custom widgets/directives.
]);

// https://docs.angularjs.org/api/ng/type/angular.Module

// there is no need to setup extra code for setting up tokens or checking the status code,
// any AngularJS service executes XHR requests will use this interceptor
// ngDocs: Use this method to register work which needs to be performed on module loading
app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
}]);

/* Setup global settings */
app.factory('settings', ['$rootScope', function ($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
        layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
app.controller('AppController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function () {
        Metronic.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
    });
}]);

/* Setup Layout Part - Header */
app.controller('HeaderController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initHeader(); // init header
    });
}]);

/* Setup Layout Part - Sidebar */
app.controller('SidebarController', ['$scope', 'authService', function ($scope, authService) {
    $scope.authentication = authService.authentication;
    $scope.$on('$includeContentLoaded', function () {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Quick Sidebar */
app.controller('QuickSidebarController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        setTimeout(function () {
            QuickSidebar.init(); // init quick sidebar        
        }, 2000)
    });
}]);

/* Setup Layout Part - Theme Panel */
app.controller('ThemePanelController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
app.controller('FooterController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initFooter(); // init footer
    });
}]);

// Handle routing errors and success events
// ngDocs: Use this method to register work which should be performed when the injector is done loading all modules.
app.run(['$state', 'authService', 'routeMediator', 'editableOptions', '$rootScope', '$location', 'settings', 'localStorageService',
    function ($state, authService, routeMediator, editableOptions, $rootScope, $location, settings, localStorageService) {
        $rootScope.$state = $state; // state to be accessed from view

        // Include $state to kick start the router.
        routeMediator.setRoutingHandlers();

        // Get Authorization Data from local storage
        authService.fillAuthData();

        editableOptions.theme = 'bs3';

        $rootScope.$on('$stateChangeStart',
          function (event, next, current) {
              debugger;
              //var isLoggedIn = $rootScope.currentUser.isLoggedIn();
              authService.fillAuthData();
              var isLoggedIn = localStorageService.get('authorizationData') != null;

              if (next.domainObjectName) {
                  if ($rootScope.currentUser.domainObjectList[next.domainObjectName] === false) {
                      event.preventDefault();
                      $rootScope.$broadcast("dangerMessage", "Your account does not have the permissions required to access this page");
                      return;
                  }
              }

              // add route config for changePassword and forgotPassword
              //if (next.name == 'changePassword' && $rootScope.canChangePassword) {
              if (next.name == 'changePassword' || next.name == 'forgotPassword'|| next.name =='Register') { // If going to changPassword and canChangePassword (has been verified on Server)
                  $rootScope.$broadcast('stateChange', next);
              } else {
                  if (next.name != 'Login' && !isLoggedIn) { // If not going to login and not logged in 
                      event.preventDefault();
                      $state.go('Login');
                  } else if (next.name == 'Login' && isLoggedIn) { // if is logged in and going to login state
                      event.preventDefault();
                  } else {
                      $rootScope.$broadcast('stateChange', next);
                  }
              }
          }
      );

        $rootScope.$on('$stateChangeSuccess', function () {
            Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menuootScope.settings.layout.pageAutoScrollOnLoad);
        });
    }]);