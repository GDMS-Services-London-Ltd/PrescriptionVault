(function () {
    'use strict';

    angular
        .module('pvapp')
        .factory('FlashService', FlashService);

    FlashService.$inject = ['$rootScope'];
    function FlashService($rootScope) {
        var service = {};

        service.Success = Success;
        service.Error = Error;
        service.ClearFlash = ClearFlash;
        service.showLoadingDialog = showLoadingDialog;
        service.hideLoadingDialog = hideLoadingDialog;
        service.setLoadingMessage = setLoadingMessage;

        initService();

        return service;

        function initService() {
            $rootScope.$on('$locationChangeStart', function () {
                clearFlashMessage();
                setLoadingMessage("");
                hideLoadingDialog();
            });

            function clearFlashMessage() {
                var flash = $rootScope.flash;
                if (flash) {
                    if (!flash.keepAfterLocationChange) {
                        delete $rootScope.flash;
                    } else {
                        // only keep for a single location change
                        flash.keepAfterLocationChange = false;
                    }
                }
            }
        }

        function ClearFlash(){
            delete $rootScope.flash;
        }

        function Success(message, keepAfterLocationChange) {
            $rootScope.flash = {
                message: message,
                type: 'success', 
                keepAfterLocationChange: keepAfterLocationChange
            };
        }

        function Error(message, keepAfterLocationChange) {

            $rootScope.flash = {
                message: message,
                type: 'error',
                keepAfterLocationChange: keepAfterLocationChange
            };
            hideLoadingDialog();
        }

        function showLoadingDialog(){
            /*$('#loadingModal').modal({
              backdrop: 'static',
              keyboard: false
            })*/
        }

        function hideLoadingDialog(){
           /* if($('#loadingModal').hasClass('in'))
                $('#loadingModal').modal('toggle');*/
        }

        function setLoadingMessage(msg){
            /*
            $rootScope.loadingmessage = msg;*/
        }


    }

})();