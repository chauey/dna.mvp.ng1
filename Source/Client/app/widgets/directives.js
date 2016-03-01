(function() {
/**
 * @description
 * 
 * App service to declare custom angular directives (so don't need to put the logic to HTML or controller).
 */

    'use strict';

    var app = angular.module('app.widgets');

    app.directive('ccImgPerson', ['config', function (config) {
        //Usage:
        //<img data-cc-img-person="{{s.speaker.imageSource}}"/>
        var basePath = config.imageSettings.imageBasePath;
        var unknownImage = config.imageSettings.unknownPersonImageSource;
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$observe('ccImgPerson', function(value) {
                value = basePath + (value || unknownImage);
                attrs.$set('src', value);
            });
        }
    }]);


    app.directive('ccSidebar', function () {
        // Opens and clsoes the sidebar menu.
        // Usage:
        //  <div data-cc-sidebar>
        // Creates:
        //  <div data-cc-sidebar class="sidebar">
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            var $sidebarInner = element.find('.sidebar-inner');
            var $dropdownElement = element.find('.sidebar-dropdown a');
            element.addClass('sidebar');
            $dropdownElement.click(dropdown);

            function dropdown(e) {
                var dropClass = 'dropy';
                e.preventDefault();
                if (!$dropdownElement.hasClass(dropClass)) {
                    hideAllSidebars();
                    $sidebarInner.slideDown(350);
                    $dropdownElement.addClass(dropClass);
                } else if ($dropdownElement.hasClass(dropClass)) {
                    $dropdownElement.removeClass(dropClass);
                    $sidebarInner.slideUp(350);
                }

                function hideAllSidebars() {
                    $sidebarInner.slideUp(350);
                    $('.sidebar-dropdown a').removeClass(dropClass);
                }
            }
        }
    });

    app.directive('ccWidgetClose', function () {
        // Usage:
        // <a data-cc-widget-close></a>
        // Creates:
        // <a data-cc-widget-close="" href="#" class="wclose">
        //     <i class="fa fa-remove"></i>
        // </a>
        var directive = {
            link: link,
            template: '<i class="fa fa-remove"></i>',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$set('href', '#');
            attrs.$set('wclose');
            element.click(close);

            function close(e) {
                e.preventDefault();
                element.parent().parent().parent().hide(100);
            }
        }
    });

    app.directive('ccWidgetMinimize', function () {
        // Usage:
        // <a data-cc-widget-minimize></a>
        // Creates:
        // <a data-cc-widget-minimize="" href="#"><i class="fa fa-chevron-up"></i></a>
        var directive = {
            link: link,
            template: '<i class="fa fa-chevron-up"></i>',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            //$('body').on('click', '.widget .wminimize', minimize);
            attrs.$set('href', '#');
            attrs.$set('wminimize');
            element.click(minimize);

            function minimize(e) {
                e.preventDefault();
                var $wcontent = element.parent().parent().next('.widget-content');
                var iElement = element.children('i');
                if ($wcontent.is(':visible')) {
                    iElement.removeClass('fa fa-chevron-up');
                    iElement.addClass('fa fa-chevron-down');
                } else {
                    iElement.removeClass('fa fa-chevron-down');
                    iElement.addClass('fa fa-chevron-up');
                }
                $wcontent.toggle(500);
            }
        }
    });

    app.directive('ccScrollToTop', ['$window',
        // Usage:
        // <span data-cc-scroll-to-top></span>
        // Creates:
        // <span data-cc-scroll-to-top="" class="totop">
        //      <a href="#"><i class="fa fa-chevron-up"></i></a>
        // </span>
        function ($window) {
            var directive = {
                link: link,
                template: '<a href="#"><i class="fa fa-chevron-up"></i></a>',
                restrict: 'A'
            };
            return directive;

            function link(scope, element, attrs) {
                var $win = $($window);
                element.addClass('totop');
                $win.scroll(toggleIcon);

                element.find('a').click(function (e) {
                    e.preventDefault();
                    // Learning Point: $anchorScroll works, but no animation
                    //$anchorScroll();
                    $('body').animate({ scrollTop: 0 }, 500);
                });

                function toggleIcon() {
                    $win.scrollTop() > 300 ? element.slideDown(): element.slideUp();
                }
            }
        }
    ]);

    app.directive('ccSpinner', ['$window', function ($window) {
        // Description:
        //  Creates a new Spinner and sets its options
        // Usage:
        //  <div data-cc-spinner="vm.spinnerOptions"></div>
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            scope.spinner = null;
            scope.$watch(attrs.ccSpinner, function (options) {
                if (scope.spinner) {
                    scope.spinner.stop();
                }
                scope.spinner = new $window.Spinner(options);
                scope.spinner.spin(element[0]);
            }, true);
        }
    }]);

    app.directive('ccWidgetHeader', function() {
        //Usage:
        //<div data-cc-widget-header title="vm.map.title"></div>
        var directive = {
            link: link,
            scope: {
                'title': '@',
                'subtitle': '@',
                'rightText': '@',
                'allowCollapse': '@'
            },
            templateUrl: '/app/layout/widgetheader.html',
            restrict: 'A',
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$set('class', 'widget-head');
        }
    });

    app.directive('ccWip', ['$state', function($state) {
        //Usage:
        //<li data-cc-wip
        //wip="vm.wip"
        //routes="vm.routes"
        //changed-event="{{vm.wipChangedEvent}}"
        //        class="nlightblue">
        //</li>
        var wipRouteName = 'Work In Progress';
        var directive = {
            controller: ['$scope', wipController],
            link: link,
            scope: {
                'wip': '=',
                'changedEvent': '@',
                'routes': '='
            },
            template: getTemplate(),
            restrict: 'A',
        };
        return directive;

        // Highlight Work in progress in sidebar
        function link(scope, element, attrs) {
            scope.$watch(wipIsCurrent, function (value) {
                value ? element.addClass('current') : element.removeClass('current');
            });

            function wipIsCurrent() {
                if (!$state.current || !$state.current.title) {
                    return false;
                }

                return $state.current.title.substr(0, wipRouteName.length) === wipRouteName;
            }
        }

        function getTemplate() {
            return '<a href="#{{wipRoute.url}}" >'
                + '<i class="fa fa-asterisk fa-fw" data-ng-class="getWipClass()"></i>'
                + 'Work in Progress ({{wip.length}})</a>';
        }

        function wipController($scope) {
            // Trick to return a TRUE boolean value "!!"
            $scope.wipExists = function () { return !!$scope.wip.length; };
            $scope.wipRoute = undefined;
            $scope.getWipClass = function () {
                return $scope.wipExists() ? 'fa-asterisk-alert fa-fw' : '';
            };

            activate();

            function activate() {
                var eventName = $scope.changedEvent;

                $scope.$on(eventName, function (event, data) {
                    $scope.wip = data.wip;
                });

                $scope.wipRoute = $scope.routes.filter(function (r) {
                    return r.config.title === wipRouteName;
                })[0];
            }
        }
    }]);

    // Simple Angular captcha: http://jsfiddle.net/marco_m_alves/LS9Ze/
    app.directive('simpleCaptcha', function () {
        // Usage:
        //<simple-captcha valid="captchaValid"></simple-captcha>
        //<div>valid: {{captchaValid}}</div>
        return {
            restrict: 'E',
            scope: { valid: '=' },
            template:   '<input ng-model="a.value" ng-show="a.input" style="width:2em; text-align: center;" placeholder="?">' +
                '           <span ng-hide="a.input">{{a.value}}</span>&nbsp;{{operation}}&nbsp;' +
                        '<input ng-model="b.value" ng-show="b.input" style="width:2em; text-align: center;" placeholder="?">' +
                        '<span ng-hide="b.input">{{b.value}}</span>&nbsp;=&nbsp;{{result}}',
            controller: function ($scope, $timeout) {
                var show = Math.random() > 0.5;
            
                var value = function(max){
                    return Math.floor(max * Math.random());
                };
            
                var int = function(str){
                    return parseInt(str, 10);
                };
            
                $scope.a = {
                    value: show? undefined : 1 + value(4),
                    input: show
                };

                $scope.b = {
                    value: !show? undefined : 1 + value(4),
                    input: !show
                };
                $scope.operation = '+';
            
                $scope.result = 5 + value(5);
            
                var a = $scope.a;
                var b = $scope.b;
                var result = $scope.result;
            
                var checkValidity = function() {
                    if (a.value && b.value) {
                        var calc = int(a.value) + int(b.value);
                        $scope.valid = calc == result;
                    } else {
                        $scope.valid = false;
                    }
                    $timeout(function() {
                        $scope.$apply(); // needed to solve 2 cycle delay problem;
                    }, 0);
                };
            
                $scope.$watch('a.value', function(){    
                    checkValidity();
                });
            
                $scope.$watch('b.value', function(){    
                    checkValidity();
                });
            }
        };
    });
})();