(function () {
    'use strict';

    angular
      .module('pvapp')
      .factory('ConnectivityMonitor', function($state,$rootScope, $cordovaNetwork, $ionicPopup, $ionicLoading, $cordovaVibration){


        function showNetworkOffline(){

                $ionicPopup.confirm({
                  title: 'No Internet Connection',
                  content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
                })
                .then(function(result) {
                  if(!result) {
                    ionic.Platform.exitApp();
                  }
                });
        }
     
      return {
        checkOffline:function(){
          if($rootScope.appOffline){
            $ionicLoading.hide();
            $cordovaVibration.vibrate(200);
            showNetworkOffline();
          }
          return $rootScope.appOffline;
        }
      }
    })

})();