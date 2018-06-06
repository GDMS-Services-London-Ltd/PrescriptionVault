/* global angular, document, window */
'use strict';

var app = angular.module('pvapp.controllers', [])

app.controller('AppCtrl', ['$scope','$state', '$ionicModal', '$ionicPopover', '$ionicPopup', '$timeout', '$ionicLoading','ConnectivityMonitor','$localstorage','AuthenticationService',
    function($scope,$state, $ionicModal, $ionicPopover, $ionicPopup, $timeout, $ionicLoading,ConnectivityMonitor, $localstorage, AuthenticationService ) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };



    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };

    

    $scope.show = function(templateText) {

    if(ConnectivityMonitor.checkOffline()){
        //offfline
        return false;
    }

    $ionicLoading.show({
      template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div><br/><i class="icon ion-android-hand stable"> </i> ' + templateText
    });

    };
    $scope.hide = function(){
        $ionicLoading.hide();
    };

    $scope.go = function ( path, params ) {
        $state.go(path, params);
    };

    
    $scope.showalertPopup = function(title, message, cb){
            
                        var alertPopup = $ionicPopup.alert({
                            title: title,
                            template: message
                        });

                        if(cb)
                            alertPopup.then(cb);
                
    }

    $scope.logout = function () {

         $ionicPopup.confirm({
                  title: 'Log Out',
                  content: 'Are you sure you want to log out?'
                })
                .then(function(result) {
                  if(result) {

                        $localstorage.clear();
                        // reset login status
                        AuthenticationService.ClearCredentials();
                    $state.go('app.login');
                }
        });
    }

}])





.controller('FriendsCtrl', function($scope, $stateParams, $timeout,$ionicNavBarDelegate,$ionicPopup, ionicMaterialInk, ionicMaterialMotion, MemberParentFactory,MemberFactory, $rootScope) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $ionicNavBarDelegate.showBackButton(true);
    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);

    // Set Motion
    ionicMaterialMotion.fadeSlideInRight();

    // Set Ink
    ionicMaterialInk.displayEffect();

    (function initController() {
            loadMembers();
    })();

        function loadMembers() {
          if($scope.show("Loading Members") == false)
            return;

            MemberParentFactory.query({reg_user_id: $rootScope.reg_user_id}).$promise.then(function (response) {   
              if (response.success)
                   $scope.members = response.result;
                 $scope.hide();
            });
        }



        $scope.deleteMember = function(mbr_id, mbr_name) {


                $ionicPopup.confirm({
                  title: 'Delete Member',
                  content: 'Are you sure you want to delete <strong>' + mbr_name +'</strong>?'
                })
                .then(function(result) {
                  if(result) {

                    if($scope.show("Deleting Member " + mbr_name) == false)
                        return;
                    //Do delete
                    MemberFactory.delete({ id: mbr_id}).$promise.then(function(response) {
                  
                      if (!response.success) {
                                $scope.showalertPopup("Delete Member " + mbr_name +" Failed", response.message);
                          } else {
                            loadMembers();
                          }

                          $scope.hide();
                      });

                  }
                });
        }
})

.controller('ContactCtrl', function($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk) {
    // Activate ink for controller
    $scope.$parent.clearFabs();
    ionicMaterialInk.displayEffect();

    

    
})





