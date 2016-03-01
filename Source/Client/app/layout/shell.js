(function () { 
    'use strict';
    
    var controllerId = 'shell';
    angular.module('app.layout').controller(controllerId,
        ['$rootScope', 'common', 'config','authService', shell]);

    function shell($rootScope, common, config, authService) {
        //$rootScope.breadcrumbs = breadcrumbs;
        var vm = this;
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var events = config.events;
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        vm.spinnerOptions = {
            radius: 40,
            lines: 7,
            length: 0,
            width: 30,
            speed: 1.7,
            corners: 1.0,
            trail: 100,
            color: '#F58A00'
        };
        vm.isSideBarVisible = true;

        activate();

        function activate() {
            logSuccess('DNA SPA-Web/Hybrid-Mobile Demo loaded!', null, true);
            common.activateController([], controllerId);
        }

        function toggleSpinner(on) { vm.isBusy = on; }

        $rootScope.$on('$stateChangeStart',
            function(event, next, current) {
                toggleSpinner(true);

                debugger;
                authService.fillAuthData();

                var isLoggedIn = $rootScope.currentUser.isLoggedIn();

                if (next.requiredPermissions) {
                    if ($rootScope.currentUser.permissions[next.requiredPermissions] === false) {
                        event.preventDefault();
                        $rootScope.$broadcast("dangerMessage", "Your account does not have the permissions required to access this page");
                        return;
                    }
                }

                // add route config for changePassword and forgotPassword
                //if (next.name == 'changePassword' && $rootScope.canChangePassword) {
                if (next.name == 'changePassword' || next.name == 'forgotPassword') { // If going to changPassword and canChangePassword (has been verified on Server)
                    $rootScope.$broadcast('stateChange', next);
                } else {
                    if (next.name != 'login' && !isLoggedIn) { // If not going to login and not logged in 
                        event.preventDefault();
                        $state.go('login');
                    } else if (next.name == 'login' && isLoggedIn) { // if is logged in and going to login state
                        event.preventDefault();
                    } else {
                        $rootScope.$broadcast('stateChange', next);
                    }
                }
            }
        );
        
        $rootScope.$on(events.controllerActivateSuccess,
            function (data) { toggleSpinner(false); }
        );

        $rootScope.$on(events.sideBarToggle,
            function (data) { vm.isSideBarVisible = data}
        );

        $rootScope.$on(events.userActionAdded,
            function (event, what, tableName, oldData, newData) {
                // call XHTMLRequest for audit log
                var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
                xmlhttp.open("POST", "api/Home/WriteAuditLog");
                xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

                //http://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
                //https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
                xmlhttp.send(JSON.stringify(JSON.decycle({
                    Id: 0,
                    Who: "",
                    What: what,
                    When: new Date((new Date()).toUTCString()),
                    TableName: tableName,
                    TableIdValue: what == "I" ? null : (what == "D" ? oldData.TypeOfTypeID : newData.TypeOfTypeID),
                    OldData: oldData,
                    NewData: newData
                })));
            }
        );
    };
})();