/***
GLobal Directives
***/

// Route State Load Spinner(used on page or content load)

app.directive('ngSpinnerBar', ['$rootScope',
    function ($rootScope) {

        return {
            link: function (scope, element, attrs) {
                // by defult hide the spinner bar
                element.addClass('hide'); // hide spinner bar by default

                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function (scrop, elem, attrs) {
                    element.removeClass('hide'); // show spinner bar
                });

                // hide the spinner bar on rounte change success(after the content loaded)
                $rootScope.$on('$stateChangeSuccess', function (scrope, elem, attrs) {
                    element.addClass('hide'); // hide spinner bar
                    $('body').removeClass('page-on-load'); // remove page loading indicator
                    Layout.setSidebarMenuActiveLink('match', elem); // activate selected link in the sidebar menu

                    // auto scorll to page top
                    setTimeout(function () {
                        Metronic.scrollTop(); // scroll to the top on content load
                    }, $rootScope.settings.layout.pageAutoScrollOnLoad);
                });

                // handle errors
                $rootScope.$on('$stateNotFound', function () {
                    element.addClass('hide'); // hide spinner bar
                });

                // handle errors
                $rootScope.$on('$stateChangeError', function () {
                    element.addClass('hide'); // hide spinner bar
                });
            }
        };
    }
])

// Handle global LINK click
app.directive('a', function () {
    return {
        restrict: 'E',
        link: function (scope, elem, attrs) {
            if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                elem.on('click', function (e) {
                    e.preventDefault(); // prevent link click for above criteria
                });
            }
        }
    };
});

// Handle Dropdown Hover Plugin Integration
app.directive('dropdownMenuHover', function () {
    return {

        link: function (scope, elem) {
            $(elem).dropdownHover();
        }
    };
});

// Handle Dropdown Toggle 
app.directive('dropdownMenuToggle', function () {
    return {
        link: function (scope, elem) {
            // if you want it to work on click, too:
            elem.dropdown();
        }
    };
});

// TODO: Use this for ACL/Domain Objects
// For: Disable/Enable Button base on Domain Object and Permissions
//app.directive('button', ['$rootScope',
//    function ($rootScope) {
//        return {
//            restrict: 'E', //E = element, A = attribute, C = class, M = comment    
//            scope: {
//                domainobjects: "=domainobjects",
//                permissions: "=permissions"
//            },
//            link: function ($scope, element, attrs) {
//                if (attrs.domainobjects != undefined && attrs.permissions != undefined) {
//
//                    var domainObjectName = attrs.domainobjects;
//                    var requiredPermission = attrs.permissions;
//                    var isAuthorized = false;
//
//                    // Loop through the cached permission list to get the required permission value
//                    for (var i = 0; i < $rootScope.permissions.length; i++) {
//                        if ((element[0].value == "Save" && $rootScope.permissions[i].Description == "Write")
//                            || (element[0].value == "Delete" && $rootScope.permissions[i].Description == "Delete")) {
//                            requiredPermission = $rootScope.permissions[i];
//                        }
//                    }
//
//                    // Loop through the cached access control list to see if the logged in user have the correct permission on the current domain object
//                    for (var i = 0; i < $rootScope.accessControlList.length; i++) {
//                        if ($rootScope.accessControlList[i].DomainObject.Name == domainObjectName
//                            && ($rootScope.accessControlList[i].PermissionValue & requiredPermission.Value) == requiredPermission.Value) {
//                            isAuthorized = true;
//                        }
//                    }
//
//                    if (isAuthorized == false) {
//                        // Disable the element
//                        $rootScope.canSave = false;
//                        $rootScope.canDelete = false;
//                    }
//                    else {
//                        // Enable the element
//                        $rootScope.canSave = true;
//                        $rootScope.canDelete = true;
//                    }
//                }
//            }
//        }
//    }
//]);

// For password match checking
app.directive('pwCheck', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    var v = elem.val()===$(firstPassword).val();
                    ctrl.$setValidity('pwmatch', v);
                });
            });
        }
    }
}]);

// For checking password strength
app.directive('checkStrength', function () {

    return {
        replace: false,
        restrict: 'EACM',
        link: function (scope, iElement, iAttrs) {
            var strength = {
                colors: ['#F00', '#F90', '#FF0', '#9F0', '#0F0'],
                mesureStrength: function (p) {

                    var _force = 0;
                    var _regex = /[$-/:-?{-~!"^_`\[\]]/g;

                    var _lowerLetters = /[a-z]+/.test(p);
                    var _upperLetters = /[A-Z]+/.test(p);
                    var _numbers = /[0-9]+/.test(p);
                    var _symbols = _regex.test(p);

                    var _flags = [_lowerLetters, _upperLetters, _numbers, _symbols];
                    var _passedMatches = $.grep(_flags, function (el) { return el === true; }).length;

                    _force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
                    _force += _passedMatches * 10;

                    // penality (short password)
                    _force = (p.length <= 6) ? Math.min(_force, 10) : _force;

                    // penality (poor variety of characters)
                    _force = (_passedMatches == 1) ? Math.min(_force, 10) : _force;
                    _force = (_passedMatches == 2) ? Math.min(_force, 20) : _force;
                    _force = (_passedMatches == 3) ? Math.min(_force, 40) : _force;

                    return _force;

                },
                getColor: function (s) {

                    var idx = 0;
                    if (s <= 10) { idx = 0; }
                    else if (s <= 20) { idx = 1; }
                    else if (s <= 30) { idx = 2; }
                    else if (s <= 40) { idx = 3; }
                    else { idx = 4; }

                    return { idx: idx + 1, col: this.colors[idx] };

                }
            };

            scope.$watch(iAttrs.checkStrength, function () {
                if (scope.vm.newPassword === '') {
                    iElement.css({ "display": "none" });
                } else {
                    var c = strength.getColor(strength.mesureStrength(scope.vm.newPassword));
                    iElement.css({ "display": "inline" });
                    iElement.children('li')
                        .css({ "background": "#DDD" })
                        .slice(0, c.idx)
                        .css({ "background": c.col });
                }
            });

        },
        template: '<li class="point"></li><li class="point"></li><li class="point"></li><li class="point"></li><li class="point"></li>'
    };

});

//#region For Angular Binding with Type
app.directive('numericbinding', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            model: '=ngModel',
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            if (scope.model && typeof scope.model == 'string') {
                scope.model = parseInt(scope.model);
            }
            scope.$watch('model', function (val, old) {
                if (typeof val == 'string') {
                    scope.model = parseInt(val);
                }
            });
        }
    };
});
//#endrgion
