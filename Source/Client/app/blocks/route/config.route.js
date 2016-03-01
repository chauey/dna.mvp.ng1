(function () {
    /**
     * @description
     *
     * Declare and handle settings for routes for navigations in the application.
     */

    'use strict';

    // #region Set 'routes' constant and config routes
    angular

        // 1. Get 'app.blocks' module
        .module('app.blocks')

        // 2. Set 'routes' app constant
        .constant('routes', getRoutes())

        // 3. Configure routes and route resolvers
        .config(routeConfigurator);

    // 3.1. Inject dependencies
    routeConfigurator.inject = ['$stateProvider', '$urlRouterProvider', 'routes'];

    // 3.2. Define routeConfigurator function
    function routeConfigurator($stateProvider, $urlRouterProvider, routes) {
        if (location.hash == "") {
            location.hash = "#/";
        }

        // 3.2.1.2. Otherwise, redirects to home/dashboard view
        $urlRouterProvider
            .otherwise('/dashboard');

        // 3.2.1. Loop through all routes
        routes.forEach(function (route) {

            // 3.2.1.1. Register allowed routes
            setRoute(route.state, route.config);
        });

        function setRoute(state, config) {
            // Sets resolver for all routes by extending any existing resolvers (or create a new one).
            config.resolve = angular.extend(config.resolve || {}, {
                prime: prime
            });

            $stateProvider.state(state, config);

            return $stateProvider;
        }
    }
    // #endregion

    // #region Functions implementation
    prime.$inject = ['datacontext'];
    function prime(datacontext) {
        return datacontext.prime();
    }

    // Define the routes
    function getRoutes() {
        var paths = {
            app: 'app',             // Original Path: "app"
            appMin: 'appbuild',     // Minified html Path: "appbuild/views"
            features: '/features'
        };

        var featuresPath = paths.app + paths.features; // 'app/feafures'

        return [
            {
                state: 'Dashboard',
                config: {
                    url: '/',
                    controller: 'DashboardController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/dashboard/dashboard.html',
                    settings: {
                        nav: 1,
                        content: '<i class="fa fa-home fa-fw"></i> <span class="title">Dashboard</span>',
                        isHeader: false,
                        isChildLevel: false,
                        hasChildLevel: false,
                        parentState: ''
                    },
                    label: 'Dashboard Page'
                }
            },

            // Base Solution Features:

            // Security - Authorization
            {
                state: 'SecurityAuthorization',
                config: {
                    url: '',
                    controller: '',
                    controllerAs: '',
                    templateUrl: '',
                    settings: {
                        nav: 4,
                        content: '<i class="icon-settings"></i> <span class="title">Security - Authorization</span><span class="arrow"></span>',
                        isHeader: false,
                        isChildLevel: false,
                        hasChildLevel: true,
                        parentState: ''
                    },
                    label: 'Security - Authorization'
                }
            },

            //#region Access Control List
            {

                //  Access Control List Item List'
                state: 'AccessControlListItemList',
                config: {
                    url: '/accessControlListItemList',
                    controller: 'accessControlListItemListController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/accessControlListItem/accessControlListItemList.html',
                    settings: {
                        nav: 19,
                        content: '<i class="fa fa-file-text-o"></i> <span class="title">Access Control List</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'SecurityAuthorization'
                    },
                    domainObjectName: 'AccessControlListItems',
                    label: ' Access Control List Items'
                }
            }, {
                //  Access Control List Item Item
                state: 'AccessControlListItemItem',
                config: {
                    url: '/accessControlListItem/:id',
                    controller: 'accessControlListItemItemController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/accessControlListItem/accessControlListItemItem.html',
                    domainObjectName: 'AccessControlListItems',
                }
            }, {

                //  Domain Object List'
                state: 'DomainObjectList',
                config: {
                    url: '/domainObjectList',
                    controller: 'domainObjectListController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/domainObject/domainObjectList.html',
                    settings: {
                        nav: 20,
                        content: '<i class="fa fa-file-text-o"></i> <span class="title">Domain Objects</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'SecurityAuthorization'
                    },
                    domainObjectName: 'DomainObjects',
                    label: ' Domain Objects'
                }
            }, {
                //  Domain Object Item
                state: 'DomainObjectItem',
                config: {
                    url: '/domainObject/:id',
                    controller: 'domainObjectItemController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/domainObject/domainObjectItem.html',
                    domainObjectName: 'DomainObjects'
                }
            }, {

                //  Permission List'
                state: 'PermissionList',
                config: {
                    url: '/permissionList',
                    controller: 'permissionListController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/permission/permissionList.html',
                    settings: {
                        nav: 21,
                        content: '<i class="fa fa-file-text-o"></i> <span class="title">Permissions</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'SecurityAuthorization'
                    },
                    domainObjectName: 'Permissions',
                    label: ' Permissions'
                }
            }, {
                //  Permission Item
                state: 'PermissionItem',
                config: {
                    url: '/permission/:id',
                    controller: 'permissionItemController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/permission/permissionItem.html',
                    domainObjectName: 'Permissions'
                }
            }, {

                //  Role List'
                state: 'RoleList',
                config: {
                    url: '/roleList',
                    controller: 'aspNetRoleListController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/aspNetRole/aspNetRoleList.html',
                    settings: {
                        nav: 22,
                        content: '<i class="fa fa-file-text-o"></i> <span class="title">Roles</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'SecurityAuthorization'
                    },
                    domainObjectName: 'AspNetRoles',
                    label: ' Roles'
                }
            }, {
                //  Role Item
                state: 'RoleItem',
                config: {
                    url: '/role/:id',
                    controller: 'aspNetRoleItemController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/aspNetRole/aspNetRoleItem.html',
                    domainObjectName: 'AspNetRoles',
                    isHeader: false,
                    isChildLevel: false,
                    hasChildLevel: false,
                    parentState: ''
                }
            },
            //#endregion

            // Base Entities
            {
                state: 'BaseEntities',
                config: {
                    url: '',
                    controller: '',
                    controllerAs: '',
                    templateUrl: '',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-file-text-o fa-fw"></i> <span class="title">Base Entities</span><span class="arrow"></span>',
                        isHeader: false,
                        isChildLevel: false,
                        hasChildLevel: true,
                        parentState: ''
                    },
                    label: 'Base Entities'
                }
            },

            {
                state: 'AllDataTypeList',
                config: {
                    url: '/allDataTypeList',
                    controller: 'AllDataTypeListController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/allDataType/allDataTypeList.html',
                    settings: {
                        nav: 1,
                        content: '<i class="fa fa-file-text-o fa-fw"></i> <span class="title">All Data Types</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'BaseEntities'
                    },
                    label: 'All Data Types'
                }
            }, {
                state: 'AllDataTypeItem',
                config: {
                    url: '/allDataType/:id',
                    controller: 'AllDataTypeItemController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/allDataType/allDataTypeItem.html',
                    settings: {}
                }
            }, {
                state: 'TypeOfTypeList',
                config: {
                    url: '/typeOfTypeList',
                    controller: 'typeOfTypeListController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/typeOfType/typeOfTypeList.html',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-file-text-o fa-fw"></i> <span class="title">Type of Types</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'BaseEntities'
                    },
                    label: 'Type of Types'
                }
            }, {
                state: 'TypeOfTypeItem',
                config: {
                    url: '/typeOfType/:id',
                    controller: 'TypeOfTypeItemController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/typeOfType/typeOfTypeItem.html',
                    settings: {}
                }
            }, {
                state: 'ValidationList',
                config: {
                    url: '/validationList',
                    controller: 'ValidationListController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/validation/validationList.html',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-check fa-fw"></i> <span class="title">Validations</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'BaseEntities'
                    },
                    label: 'Validations'
                }
            }, {
                state: 'ValidationItem',
                config: {
                    url: '/validation/:id',
                    controller: 'ValidationItemController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/validation/validationItem.html',
                    settings: {}
                }
            },

             // Modules
            {
                state: 'Modules',
                config: {
                    url: '',
                    controller: '',
                    controllerAs: '',
                    templateUrl: '',
                    settings: {
                        nav: 2,
                        content: '<i class="icon-settings"></i> <span class="title">Modules</span><span class="arrow"></span>',
                        isHeader: false,
                        isChildLevel: false,
                        hasChildLevel: true,
                        parentState: ''
                    },
                    label: 'Modules'
                }
            },

            //#region Payment
            {
                state: 'PaymentInformation',
                config: {
                    url: '/payment',
                    controller: 'ManagePaymentController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/payment/managePayment.html',
                    settings: {
                        nav: 1,
                        content: '<i class="fa fa-asterisk fa-fw"></i> Payment Information',
						isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'Modules'
                    },
                    label: 'Payment Information'
                }
            },
            {
                state: 'AddPaymentInformation',
                config: {
                    url: '/addCard/:id',
                    controller: 'AddCardController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/payment/addCard.html',
                    settings: {}
                }
            },
            {
                state: 'Subscription',
                config: {
                    url: '/subscription',
                    controller: 'SubscriptionController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/payment/subscription.html',
                    settings: {}
                }
            },
            {
                state: 'RegisterStripe',
                config: {
                    url: '/registerStripe/:planId',
                    controller: 'RegisterStribeController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/payment/register.html',
                    settings: {}
                }
            },

            // User Accounts
            {
                state: 'Users',
                config: {
                    url: '/user',
                    controller: 'userListController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/user/userList.html',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-file-text-o fa-fw"></i> <span class="title">User Accounts</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'Modules'
                    },
                    label: 'User Accounts'
                }
            },
            {
                state: 'User',
                config: {
                    url: '/user/:id',
                    controller: 'userItemController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/user/userItem.html',
                    settings: {}
                }
            }, {
                state: 'UserProfile',
                config: {
                    url: '/profile',
                    controller: 'UserProfileController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/userProfileMetronic/main.html',
                    settings: {
                        nav: 3,
                        content: '<i class="icon-user"></i> <span class="title">User Profile</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'Modules'
                    },
                    label: 'Metronic User Profile'
                }
            },


            // Others
            {
                state: 'Others',
                config: {
                    url: '',
                    controller: '',
                    controllerAs: '',
                    templateUrl: '',
                    settings: {
                        nav: 5,
                        content: '<i class="fa fa-asterisk fa-fw"></i> <span class="title">Others</span><span class="arrow"></span>',
                        isHeader: false,
                        isChildLevel: false,
                        hasChildLevel: true,
                        parentState: ''
                    },
                    label: 'Others'
                }
            },

            {
                state: 'Styling',
                config: {
                    url: '/styling',
                    controller: 'StylingController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/styling/styling.html',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-paint-brush fa-fw"></i> <span class="title">Styling Samples</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'Others'
                    },
                    label: 'Styling'
                }
            },
            {
                state: 'Admin',
                config: {
                    url: '/admin',
                    controller: 'AdminController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/admin/admin.html',
                    settings: {
                        nav: 1,
                        content: '<i class="fa fa-lock fa-fw"></i> <span class="title">Admin Panel</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'Others'
                    },
                    label: 'Admin Panel'
                }
            }, {
                state: 'UIElements',
                config: {
                    url: '/ui',
                    controller: 'UiController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/ui/ui.html',
                    settings: {
                        nav: 4,
                        content: '<i class="fa fa-picture-o fa-fw"></i> <span class="title">UI Elements</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'Others'
                    },
                    label: 'UI Elements'
                }
            },



            // File Upload
            {
                state: 'FileUpload',
                config: {
                    url: '/upload',
                    controller: 'FileUploadController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/fileUpload/fileUpload.html',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-cloud-upload"></i> <span class="title">File Upload</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'Others'
                    },
                    label: 'File Upload'
                }
            },
            {
                state: 'WorkInProgress',
                config: {
                    url: '/workinprogress',
                    controller: 'WipController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/wip/wip.html',
                    settings: {
                        nav: 5,
                        content: '<i class="fa fa-asterisk fa-fw"></i> <span class="title">Work In Progress</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'Others'
                    },
                    label: 'Work In Progress'
                }
            },
            // Customers
            {
                state: 'Customers',
                config: {
                    url: '/customers',
                    controller: 'customerListController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/customer/customerList.html',
                    settings: {
                        nav: 6,
                        content: '<i class="fa fa-user fa-fw"></i> <span class="title">Customers</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'Others'
                    },
                    label: 'Customers'
                }
            },
            {
                state: 'Customer',
                config: {
                    url: '/customer/:id',
                    controller: 'customerItemController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/customer/customerItem.html',
                    settings: {}
                }
            },


            // Metronic Features
            {
                state: 'Metronic',
                config: {
                    url: '',
                    controller: '',
                    controllerAs: '',
                    templateUrl: '',
                    settings: {
                        nav: 6,
                        content: 'Metronic Features',
                        isHeader: true,
                        isChildLevel: false,
                        hasChildLevel: false,
                        parentState: ''
                    },
                    label: 'Metronic'
                }
            }, {
                state: 'DashboardMetronic',
                config: {
                    url: '/dashboard',
                    controller: 'DashboardMetronicController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/dashboardMetronic/dashboardMetronic.html',
                    settings: {
                        nav: 7,
                        content: '<i class="icon-home"></i> <span class="title">Metronic Dashboard</span>',
                        isHeader: false,
                        isChildLevel: false,
                        hasChildLevel: false,
                        parentState: ''
                    },
                    label: 'Metronic Dashboard Page'
                }
            }, {
                state: 'AngularJSFeaturesMetronic',
                config: {
                    url: '',
                    controller: '',
                    controllerAs: '',
                    templateUrl: '',
                    settings: {
                        nav: 8,
                        content: '<i class="icon-settings"></i> <span class="title">AngularJS Features</span><span class="arrow"></span>',
                        isHeader: false,
                        isChildLevel: false,
                        hasChildLevel: true,
                        parentState: ''
                    },
                    label: 'Metronic AngularJS Features'
                }
            }, {
                state: 'UIBootstrapMetronic',
                config: {
                    url: '/UIBootstrap',
                    controller: 'UIBootstrapController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/uiBootstrapMetronic/uiBootstrap.html',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-puzzle"></i> <span class="title">UI Bootstrap</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'AngularJSFeaturesMetronic'
                    },
                    label: 'Metronic UI Bootstrap'
                }
            },
            //{
            //    state: 'FileUploadMetronic',
            //    config: {
            //        url: '/fileUploadMetronic',
            //        controller: 'FileUploadMetronicController',
            //        controllerAs: 'vm',
            //        templateUrl: featuresPath + '/fileUploadMetronic/fileUpload.html',
            //        settings: {
            //            nav: 2,
            //            content: '<i class="icon-paper-clip"></i> <span class="title">File Upload</span>',
            //            isHeader: false,
            //            isChildLevel: true,
            //            hasChildLevel: false,
            //            parentState: 'AngularJSFeaturesMetronic'
            //        },
            //        label: 'Metronic File Upload'
            //    }
            //},

            {
                state: 'UISelectMetronic',
                config: {
                    url: '/uiSelect',
                    controller: 'UISelectController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/uiSelectMetronic/uiSelect.html',
                    settings: {
                        nav: 3,
                        content: '<i class="icon-check"></i> <span class="title">UI Select</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'AngularJSFeaturesMetronic'
                    },
                    label: 'Metronic UI Select'
                }

            }, {
                state: 'JqueryPluginsMetronic',
                config: {
                    url: '/jqueryPlugins',
                    controller: '',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/dashboardMetronic/dashboardMetronic.html',
                    settings: {
                        nav: 9,
                        content: '<i class="icon-wrench"></i> <span class="title">Jquery Plugins</span><span class="arrow"></span>',
                        isHeader: false,
                        isChildLevel: false,
                        hasChildLevel: true,
                        parentState: ''
                    },
                    label: 'Metronic Jquery Plugins'

                },
            },
                //#endregion

            {
                state: 'FormTools',
                config: {
                    url: '/formTools',
                    controller: 'FormToolController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/formToolsMetronic/formTools.html',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-puzzle"></i> <span class="title">Form Tools</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'JqueryPluginsMetronic',
                    },
                    label: 'Metronic Form Tools',
                }
            }, {
                state: 'DateTimePicker',
                config: {
                    url: '/dateTimePickers',
                    controller: 'DateTimePickerController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/dateTimePickerMetronic/dateTimePickers.html',
                    settings: {
                        nav: 2,
                        content: '<i class="icon-calendar"></i> <span class="title">Date & Time Pickers</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'JqueryPluginsMetronic'
                    },
                    label: 'Metronic Date Time Picker'
                }
            }, {
                state: 'CustomDropDown',
                config: {
                    url: '/dropdown',
                    controller: 'CustomDropdownController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/customDropdownMetronic/customDropdown.html',
                    settings: {
                        nav: 3,
                        content: '<i class="icon-refresh"></i> <span class="title">Custom Dropdowns</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'JqueryPluginsMetronic'
                    },
                    label: 'Metronic Custom Dropdown'
                }
            }, {
                state: 'TreeView',
                config: {
                    url: '/treeView',
                    controller: 'TreeViewController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/treeViewMetronic/treeView.html',
                    settings: {
                        nav: 4,
                        content: '<i class="icon-share"></i> <span class="title">Tree View</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'JqueryPluginsMetronic'
                    },
                    label: 'Metronic Tree View'
                }
            }, {
                state: 'DataTables',
                config: {
                    url: '',
                    controller: '',
                    controllerAs: '',
                    templateUrl: '',
                    settings: {
                        nav: 4,
                        content: '<i class="icon-briefcase"></i> <span class="title">Datatables</span><span class="arrow"></span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: true,
                        parentState: 'JqueryPluginsMetronic'
                    },
                    label: 'Metronic Datatables'
                }
            }, {
                state: 'AdvancesDataTables',
                config: {
                    url: '/advancesDatatables',
                    controller: 'AdvancesDataTablesController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/dataTablesMetronic/advanceDataTables.html',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-tag"></i> <span class="title">Advances Datatables</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'DataTables'
                    },
                    label: 'Metronic Advances DataTables'
                }
            }, {
                state: 'AjaxDataTables',
                config: {
                    url: '/ajaxDatatables',
                    controller: 'AjaxDataTablesController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/dataTablesMetronic/ajaxDataTables.html',
                    settings: {
                        nav: 2,
                        content: '<i class="icon-refresh"></i> <span class="title">Ajax Datatables</span>',
                        isHeader: false,
                        isChildLevel: true,
                        hasChildLevel: false,
                        parentState: 'DataTables'
                    },
                    label: 'Metronic Ajax DataTables'
                }
            }, {
                state: 'UserProfile.Dashboard',
                config: {
                    url: '/dashboard',
                    controller: 'UserProfileController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/userProfileMetronic/dashboard.html',
                    settings: {}
                }
            }, {
                state: 'UserProfile.Account',
                config: {
                    url: '/account',
                    controller: 'UserProfileController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/userProfileMetronic/account.html',
                    settings: {}
                }
            }, {
                state: 'UserProfile.Help',
                config: {
                    url: '/help',
                    controller: 'UserProfileController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/userProfileMetronic/help.html',
                    settings: {}
                }
            }, {
                state: 'TaskAndTodo',
                config: {
                    url: '/todo',
                    controller: 'TaskAndTodoController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/taskAndTodoMetronic/taskAndTodo.html',
                    settings: {
                        nav: 7,
                        content: '<i class="icon-check"></i> <span class="title">Task & Todo</span>',
                        isHeader: false,
                        isChildLevel: false,
                        hasChildLevel: false,
                        parentState: ''
                    },
                    label: 'Metronic Task and Todo'
                }
            },




            //#region Membership
            {
                state: 'Login',
                config: {
                    url: '/login',
                    controller: 'LoginController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/membership/login.html',
                    settings: {}
                }
            }, {
                state: 'Register',
                config: {
                    url: '/register',
                    controller: 'RegisterController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/membership/register.html',
                    settings: {}
                }
            }, {
                state: 'ForgotPassword',
                config: {
                    url: '/forgotPassword',
                    controller: 'ForgotPasswordController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/membership/forgotPassword.html',
                    settings: {}
                }
            }, {
                state: 'ResetPassword',
                config: {
                    url: '/resetPassword?userId&token',
                    controller: 'ResetPasswordController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/membership/resetPassword.html',
                    settings: {},
                }
            }, {
                state: 'ManageAccount',
                config: {
                    url: '/manage',
                    controller: 'ManageController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/membership/manage.html',
                    settings: {}
                }
            }, {
                state: 'AuthenticationComplete',
                config: {
                    url: '/authComplete',
                    templateUrl: featuresPath + '/membership/authComplete.html',
                    settings: {}
                }
            }, {
                state: 'AccountAssociation',
                config: {
                    url: '/associate',
                    controller: 'AssociateController',
                    controllerAs: 'vm',
                    templateUrl: featuresPath + '/membership/associate.html',
                    settings: {}
                }
            },
            //#endregion




        ];
    }
    // #endregion
})();