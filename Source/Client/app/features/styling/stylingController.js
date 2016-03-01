// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'StylingController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, StylingController);

    // 2. Inject dependencies
    StylingController.$inject = ['bootstrap.dialog', 'common'];

    // #region 3. Define controller
    function StylingController(bsDialog, common) {

        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logSuccess = getLogFn(controllerId, 'success');
        var logWarning = getLogFn(controllerId, 'warning');
        var logError = getLogFn(controllerId, 'error');

        var vm = this;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.title = {
            toastr: 'Toastr v.2.0.3',
            fa: 'FontAwesome v4.2.0',
            bs: 'Bootstrap v3.2.0'
        }
        vm.subtitle = {
            fa: 'The iconic font and CSS toolkit',
            toastr: 'Simple Javascript toast notifications',
            bs: 'HTML, CSS, and Javascript code designed to help build user interface components'
        }

        vm.showToast = showToast;
        vm.repeat = repeat;
        vm.showModal = showModal;

        vm.activate = activate;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated Boostrap Demo View.'); });
        }

        function repeat(num) {
            return new Array(num);
        }

        function showToast(name) {
            switch (name) {
                default:
                {
                    log('Toast default notification.');
                    break;
                }
                case 'success':
                {
                    logSuccess('Toast success notification.');
                    break;
                }
                case 'warn':
                {
                    logWarning('Toast warning notification.');
                    break;
                }
                case 'error':
                {
                    logError('Toast error notification.');
                    break;
                }
                case 'clear':
                {
                    toastr.clear();
                }
            }
        }

        function showModal(name) {
            switch (name) {
            case'error':
            {
                return bsDialog.deleteDialog('item');
            }
            default:
            {
                return bsDialog.confirmationDialog('Modal heading', 'Modal body', 'OK', 'Cancel');
            }
            }
        }
        // #endregion
    }
    // #endregion
})();
