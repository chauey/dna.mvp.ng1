(function () {
/**
 * @description
 * 
 * Configuration settings for the application: 
 * - toastr (javascript notifications).
 * - values (constants): events, keyCodes, remoteServiceName (for API calls).
 * - configurations: logProvider, common (custom service), zStorage and zStorageWip, validations.
 * IMPORTANT: app.config executes before app.run.
 */

    'use strict';

    var app = angular.module('app.core');

    // Configure Toastr
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-bottom-right';
    // demo: http://codeseven.github.io/toastr/demo.html

    var keyCodes = {
        backspace: 8,
        tab: 9,
        enter: 13,
        esc: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        insert: 45,
        del: 46
    };

    // For use with the HotTowel-Angular-Breeze add-on that uses Breeze
    var remoteServiceName = 'http://localhost:9000/';
    var deployServiceName = 'http://localhost:9000/';

    var events = {
        controllerActivateSuccess: 'controller.activateSuccess',
        spinnerToggle: 'spinner.toggle',
        sideBarToggle: 'sideBar.toggle',
        hasChangesChanged: 'datacontext.hasChangesChanged',
        entitiesChanged: 'datacontext.entitiesChanged',
        userActionAdded: 'user.actionAdded',
        storage: {
            error: 'store.error',
            storeChanged: 'store.changed',
            wipChanged: 'wip.changed'
        }
    };

    var config = {
        appErrorPrefix: '[DNA Error] ', //Configure the exceptionHandler decorator
        docTitle: 'DNA Lean Startup MVP AngularJS Web/Hybrid-mobile Template: ',
        events: events,
        keyCodes: keyCodes,
        remoteServiceName: remoteServiceName,
        version: '2.1.0',
        facebookAuthClientId: '834760529948191',
        googleAuthClientId: '474818352230-98ng0du6l7sg1d5gqoukbs25fn95hmgp.apps.googleusercontent.com'
    };


    // #region DateField Config
    function openDatePopup($event) {
        $event.preventDefault();
        $event.stopPropagation();

        datePickerConfig.opened = true;
    }
    function isDatePickerDisable(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    }
    // #endregion

    var datePickerConfig = {
        opened : false,
        format: 'yyyy/MM/dd',
        dateOptions : {
            formatYear: 'yy',
            startingDay: 1
        },
        open: openDatePopup,
        disabled: isDatePickerDisable
    }

    
    app.value('config', config);
    app.value('datePickerConfig', datePickerConfig);
    
    app.config(['$logProvider', function ($logProvider) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);
    
    //#region Configure the common services via commonConfig
    app.config(['commonConfigProvider', function (cfg) {
        cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
        cfg.config.spinnerToggleEvent = config.events.spinnerToggle;
        cfg.config.sideBarToggleEvent = config.events.sideBarToggle;
        cfg.config.userActionAddedEvent = config.events.userActionAdded;
    }]);
    //#endregion

    //#region Configure the zStorage and zStorageWip services via zStorageConfig
    app.config(['zStorageConfigProvider', function (cfg) {
        cfg.config = {
            // zStorage
            enabled: false,
            key: 'DnaSpa-Web/Hybrid-MobileDemoNgZ',
            events: events.storage,
            appErrorPrefix: config.appErrorPrefix,
            version: config.version,
            // zStorageWip
            wipKey: 'DnaSpa-Web/Hybrid-MobileDemoNgZ.WIP',
            newGuid: breeze.core.getUuid
        };
    }]);
    //#endregion

    //#region Configure Breeze Validation Directive
    app.config(['zDirectivesConfigProvider', function (cfg) {
        cfg.zValidateTemplate =
                     '<span class="invalid"><i class="fa fa-warning fa-fw"></i>' +
                     'Error: %error%</span>';
        //cfg.zRequiredTemplate =
        //    '<i class="icon-asterisk icon-asterisk-invalid z-required" title="Required"></i>';
    }]);

    // Learning Point:
    // Can configure during config or app.run phase
    //app.run(['zDirectivesConfig', function(cfg) {
    //    cfg.zValidateTemplate =
    //                 '<span class="invalid"><i class="icon-warning-sign"></i>' +
    //                 'Inconceivable! %error%</span>';
    //}]);

    //#endregion

    //#region Configure image whiteList
    app.config(['$compileProvider', function ($compileProvider) {
        var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
    }]);
    //#endregion
})();