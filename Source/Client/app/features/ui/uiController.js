// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'UiController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, UiController);

    // 2. Inject dependencies
    UiController.$inject = ['$scope', '$timeout', 'bootstrap.dialog', 'common'];

    // #region 3. Define controller
    function UiController($scope, $timeout, bsDialog, common) {

        // #region 3.1 Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logWarning = getLogFn(controllerId, 'warn');

        var vm = this;
        // #endregion

        // #region 3.2 Define bindable variables to the view
        //#region HighCharts
        vm.chartTypes = [
            { 'id': 'line', 'title': 'Line' },
            { 'id': 'spline', 'title': 'Smooth line' },
            { 'id': 'area', 'title': 'Area' },
            { 'id': 'areaspline', 'title': 'Smooth area' },
            { 'id': 'column', 'title': 'Column' },
            { 'id': 'bar', 'title': 'Bar' },
            { 'id': 'pie', 'title': 'Pie' },
            { 'id': 'scatter', 'title': 'Scatter' }
        ];

        vm.chartSeries = [
            { 'name': 'Smooth Area', 'data': [1, 2, 4, 7, 3], type: 'areaspline' },
            { 'name': 'Line', 'data': [3, 1, null, 5, 2], connectNulls: true, type: 'line' },
            { 'name': 'Column 1', 'data': [5, 2, 2, 3, 5], type: 'column' },
            { 'name': 'Column 2', 'data': [1, 1, 2, 3, 2], type: 'column' }
        ];

        vm.chartStack = [
            { "id": '', "title": "No" },
            { "id": "normal", "title": "Normal" },
            { "id": "percent", "title": "Percent" }
        ];

        vm.addPoints = function () {
            var seriesArray = vm.chartConfig.series;
            var rndIdx = Math.floor(Math.random() * seriesArray.length);
            seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20]);
        };

        vm.addSeries = function () {
            var rnd = []
            for (var i = 0; i < 10; i++) {
                rnd.push(Math.floor(Math.random() * 20) + 1);
            }
            vm.chartConfig.series.push({
                data: rnd
            });
        }

        //vm.removeRandomSeries = function() {
        //    if (vm.chartConfig.series.length == 1) {
        //        return logWarning('HighCharts: There should be at least 1 series.');
        //    }
        //    var seriesArray = vm.chartConfig.series;
        //    var rndIdx = Math.floor(Math.random() * seriesArray.length);
        //    seriesArray.splice(rndIdx, 1);
        //}

        vm.removeSeries = function (id) {
            return bsDialog.confirmationDialog('Remove', 'Do you want remove this series?', 'Yes', 'No')
               .then(confirm);

            function confirm() {
                if (vm.chartConfig.series.length == 1) {
                    return logWarning('HighCharts: There should be at least 1 series.');
                }

                var seriesArray = vm.chartConfig.series;
                seriesArray.splice(id, 1);
            }
        }

        vm.chartConfig = {
            options: {
                chart: {
                    type: vm.chartTypes[0].id
                    },
                plotOptions: {
                    series: {
                        dataLabels: { enabled: true, style: { fontSize: '15px' } },
                        stacking: ''
                    }
                }
            },
            credits: {
                enabled: true,
            },
            series: vm.chartSeries,
            title: {
                text: 'HighCharts Demo'
            }
        }
        //#endregion

        //#region Wijmo 5 FlexGrid // http://demos.componentone.com/wijmo/5/Angular/FlexGridIntro/FlexGridIntro/
        var countries = 'US,Germany,UK,Japan,Italy,Greece'.split(','),
        data = [];
        for (var i = 0; i < 100; i++) {
            data.push({
                id: i,
                country: countries[i % countries.length],
                date: new Date(2014, i % 12, i % 28),
                amount: Math.random() * 10000,
                active: i % 4 == 0
            });
        }
        vm.data = data;

        vm.selectionMode = 'CellRange';
        vm.isReadOnly = false;

        // Paging
        vm.cvData = new wijmo.collections.CollectionView(data);
        vm.cvData.pageSize = 20;

        // Grouping
        vm.groupBy = '';
        $scope.$watch('vm.groupBy', function () { // update CollectionView group descriptions when groupBy changes
            var cv = vm.cvData;
            cv.groupDescriptions.clear(); // clear current groups
            if (vm.groupBy) {
                var groupNames = vm.groupBy.split(',');
                for (var i = 0; i < groupNames.length; i++) {
                    var groupName = groupNames[i];
                    if (groupName == 'date') { // ** group dates by year
                        var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName, function (item, prop) {
                            return item.date.getFullYear();
                        });
                        cv.groupDescriptions.push(groupDesc);
                    } else if (groupName == 'amount') { // ** group amounts in ranges
                        var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName, function (item, prop) {
                            return item.amount >= 5000 ? '> 5,000' : item.amount >= 500 ? '500 to 5,000' : '< 500';
                        });
                        cv.groupDescriptions.push(groupDesc);
                    } else { // ** group everything else by value
                        var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName);
                        cv.groupDescriptions.push(groupDesc);
                    }
                }
            }
        });

        // Filtering
        vm.filter = '';
        var toFilter, lcFilter;
        vm.cvData.filter = function (item) { // ** filter function
            if (!vm.filter) { return true; }
            return item.country.toLowerCase().indexOf(lcFilter) > -1;
        };
        $scope.$watch('vm.filter', function () { // ** refresh view when filter changes
            if (toFilter) { clearTimeout(toFilter); }
            toFilter = setTimeout(function () {
                lcFilter = vm.filter.toLowerCase();
                vm.cvData.refresh();
            }, 500);
        });

        //// Master-Detail
        //vm.cvData.currentChanged.addHandler(function () {
        //    $scope.$apply('vm.cvData.currentItem');
        //});

        // Conditional Styling
        vm.getAmountColor = function (amount) {
            if (amount < 2500) return 'black';
            if (amount < 5000) return 'green';
            return 'blue';
        }

        // Custom Theming
        vm.useTheme = false;
        vm.theme = '';
        $scope.$watch('vm.useTheme', function () {
            if (vm.useTheme) { vm.theme = 'custom-flex-grid'; }
            else { vm.theme = ''; }
        });

        // Trees and Hierarchical Data
        vm.treeData = [
            {
                name: '\u266B Adriane Simione',
                items: [
                    {
                        name: '\u266A Intelligible Sky',
                        items: [
                            { name: 'Theories', length: '2:02' },
                            { name: 'Giant Eyes', length: '3:29' },
                            { name: 'Jovian Moons', length: '1:02' },
                            { name: 'Open Minds', length: '2:41' },
                            { name: 'Spacetronic Eyes', length: '3:41' }
                        ]
                    }
                ]
            },
            {
                name: '\u266B Amy Winehouse',
                items: [
                    {
                        name: '\u266A Back to Black',
                        items: [
                            { name: 'Addicted', length: '1:34' },
                            { name: 'He Can Only Hold Her', length: '2:22' },
                            { name: 'Some Unholy War', length: '2:21' },
                            { name: 'Wake Up Alone', length: '3:43' },
                            { name: 'Tears Dry On Their Own', length: '1:25' }
                        ]
                    },
                    {
                        name: '\u266A Live in Paradiso',
                        items: [
                            { name: "You Know That I'm No Good", length: '2:32' },
                            { name: 'Wake Up Alone', length: '1:04' },
                            { name: 'Valerie', length: '1:22' },
                            { name: 'Tears Dry On Their Own', length: '3:15' },
                            { name: 'Rehab', length: '3:40' }
                        ]
                    }
                ]
            },
            {
                name: '\u266B Black Sabbath',
                items: [
                    {
                        name: '\u266A Heaven and Hell',
                        items: [
                            { name: 'Neon Knights', length: '3:03' },
                            { name: 'Children of the Sea', length: '2:54' },
                            { name: 'Lady Evil', length: '1:43' },
                            { name: 'Heaven and Hell', length: '2:23' },
                            { name: 'Wishing Well', length: '3:22' },
                            { name: 'Die Young', length: '2:21' }
                        ]
                    },
                    {
                        name: '\u266A Never Say Die!',
                        items: [
                            { name: 'Swinging The Chain', length: '4:32' },
                            { name: 'Breakout', length: '3:54' },
                            { name: 'Over To You', length: '2:43' },
                            { name: 'Air Dance', length: '1:34' },
                            { name: 'Johnny Blade', length: '1:02' },
                            { name: 'Never Say Die', length: '2:11' }
                        ]
                    },
                    {
                        name: '\u266A Paranoid',
                        items: [
                            { name: 'Rat Salad', length: '3:44' },
                            { name: 'Hand Of Doom', length: '4:21' },
                            { name: 'Electric Funeral', length: '2:12' },
                            { name: 'Iron Man', length: '3:22' },
                            { name: 'War Pigs', length: '3:13' }
                        ]
                    }
                ]
            },
            {
                name: '\u266B Brand X',
                items: [
                    {
                        name: '\u266A Unorthodox Behaviour',
                        items: [
                            { name: 'Touch Wood', length: '2:54' },
                            { name: 'Running of Three', length: '1:34' },
                            { name: 'Unorthodox Behaviour', length: '2:23' },
                            { name: 'Smacks of Euphoric Hysteria', length: '3:12' },
                            { name: 'Euthanasia Waltz', length: '2:22' },
                            { name: 'Nuclear Burn', length: '4:01' }
                        ]
                    }
                ]
            }
        ];
        //#endregion

        //#region KendoUI
        // AutoComplete
        vm.countryNames = [
        "Albania","Andorra","Armenia","Austria","Azerbaijan","Belarus","Belgium","Bosnia & Herzegovina",
        "Bulgaria","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Finland","France","Georgia",
        "Germany","Greece","Hungary","Iceland","Ireland","Italy","Kosovo","Latvia","Liechtenstein",
        "Lithuania","Luxembourg","Macedonia","Malta","Moldova","Monaco","Montenegro","Netherlands",
        "Norway","Poland","Portugal","Romania","Russia","San Marino","Serbia","Slovakia","Slovenia",
        "Spain","Sweden","Switzerland","Turkey","Ukraine","United Kingdom","Vatican City"
        ];

        //// Calendar
        //$scope.$watch("vm.startDate", function (val) {
        //    var maxEndDate = new Date(val);
        //    maxEndDate.setDate(maxEndDate.getDate() + 14);
        //    vm.maxEndDate = maxEndDate;
        //    delete vm.endDate;
        //});

        // ComboBox RemoteData
        //vm.productsDataSource = {
        //    type: "odata",
        //    serverFiltering: true,
        //    transport: {
        //        read: {
        //            url: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Products",
        //        }
        //    }
        //}

        // DropDownList
        //vm.customersDataSource = {
        //    transport: {
        //        read: {
        //            dataType: "jsonp",
        //            url: "https://demos.telerik.com/kendo-ui/service/Customers",
        //        }
        //    }
        //};

        //vm.customOptions = {
        //    dataSource: vm.customersDataSource,
        //    dataTextField: "ContactName",
        //    dataValueField: "CustomerID",

        //    headerTemplate: '<div class="dropdown-header">' +
        //        '<span class="k-widget k-header">Photo</span>' +
        //        '<span class="k-widget k-header">Contact info</span>' +
        //        '</div>',

        //    // using {{angular}} templates:
        //    valueTemplate: '<img class="selected-value" src=\"https://demos.telerik.com/kendo-ui/content/web/Customers/{{dataItem.CustomerID}}.jpg\" alt=\"{{dataItem.CustomerID}}\" /><span>{{dataItem.ContactName}}</span>',

        //    template: '<span class="k-state-default"><img src=\"https://demos.telerik.com/kendo-ui/content/web/Customers/{{dataItem.CustomerID}}.jpg\" alt=\"{{dataItem.CustomerID}}\" /></span>' +
        //        '<span class="k-state-default"><h3>{{dataItem.ContactName}}</h3><p>{{dataItem.CompanyName}}</p></span>',
        //};

        // Editor
    //    vm.html = "<h1>Kendo Editor</h1>\n\n" +
    //"<p>Note that “change” is triggered when the editor loses focus.\n" +
    //"<br /> That's when the Angular scope gets updated.</p>";

        // MaskedTextBox
        vm.phone = "555 123 4567";
        vm.cc = "1234 1234 1234 1234";
        vm.ssn = "003-12-3456";
        vm.post = "W1N 1AC";

        // Menu
        vm.menuOrientation = "horizontal";
        vm.onSelect = function (ev) {
            log($(ev.item.firstChild).text());
        };

        // MultiSelect
        //vm.selectOptions = {
        //    placeholder: "Select products...",
        //    dataTextField: "ProductName",
        //    dataValueField: "ProductID",
        //    autoBind: false,
        //    dataSource: {
        //        type: "odata",
        //        serverFiltering: true,
        //        transport: {
        //            read: {
        //                url: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Products",
        //            }
        //        }
        //    }
        //};
        vm.selectedIds = [4, 7];

        // NumericTextbox
        vm.ntValue = 50;

        // ProgressBar
        vm.status = "Working...";
        vm.progress = 0;
        vm.labels = [
          "Installing start menu items",
          "Registering components",
          "Having a coffee"
        ];
        var i = -1;
        function update() {
            vm.progress += random(0, 10);
            if (vm.progress > random(70, 90)) {
                vm.progress = random(5, 50);
                i = (i + 1) % vm.labels.length;
                vm.status = vm.labels[i];
            }
            $timeout(update, 200);
        }
        function random(a, b) {
            return a + Math.floor(Math.random() * (b - a));
        }
        update();

        // Spliter
        vm.orientation = "horizontal";
        //#endregion
        // #endregion

        // 3.3 Run activate method
        activate();

        // #region 3.4 Controller functions implementation
        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated UI Elements View'); });
        }
        // #endregion
    }
    // #endregion
})();
