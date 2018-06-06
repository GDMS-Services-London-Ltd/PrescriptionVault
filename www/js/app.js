// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('pvapp', ['ionic', 'pvapp.controllers', 'ionic-material', 'ionMdInput', 'pvapp.services', 'ngCookies', 'ngMessages', 'ngCordova', 'ngMaterial', 'ui.bootstrap', 'xeditable'])
.config(config)
.run(run);


run.$inject = ['$ionicPlatform', '$rootScope', '$state', '$location', '$cookieStore', '$http', 'redirectToUrlAfterLogin', '$ionicNavBarDelegate', '$ionicPopup', '$cordovaGeolocation', 'ConnectivityMonitor', 'editableOptions', '$cordovaFile'];
function run($ionicPlatform, $rootScope, $state, $location, $cookieStore, $http, redirectToUrlAfterLogin, $ionicNavBarDelegate, $ionicPopup, $cordovaGeolocation, ConnectivityMonitor, editableOptions, $cordovaFile){

editableOptions.theme = 'default';
editableOptions.icon_set = 'right';

$rootScope.checkConnection = function(){
    var networkState = navigator.connection.type;

    var networkstates = {};
    networkstates[Connection.UNKNOWN]  = 'Unknown connection';
    networkstates[Connection.ETHERNET] = 'Ethernet connection';
    networkstates[Connection.WIFI]     = 'WiFi connection';
    networkstates[Connection.CELL_2G]  = 'Cell 2G connection';
    networkstates[Connection.CELL_3G]  = 'Cell 3G connection';
    networkstates[Connection.CELL_4G]  = 'Cell 4G connection';
    networkstates[Connection.CELL]     = 'Cell generic connection';
    networkstates[Connection.NONE]     = 'No network connection';

    console.log(' + app: Connection type: ' + networkstates[networkState]);
};

$rootScope.onOffline = function(){
    console.log("You Are Offline :(");
    $rootScope.appOffline = true;

    //Show message as soon as device go offline
     //ConnectivityMonitor.checkOffline();
};

$rootScope.onOnline = function(){
    console.log("You Are Online :D");
    $rootScope.appOffline = false;
};


$rootScope.currentPosition = {};


    $ionicPlatform.ready(function() {

        //ConnectivityMonitor.startWatching();

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        $cordovaFile.checkDir(cordova.file.externalRootDirectory, "PrescriptionVault")
                .then(function (success) {
                       $cordovaFile.createDir(cordova.file.externalRootDirectory, "PrescriptionVault", false)
                      .then(function (success) {
                        // success
                      });  
        });


        console.log(" + app: DeviceReady");

        $rootScope.checkConnection();
        document.addEventListener("offline", $rootScope.onOffline, false);
        document.addEventListener("online", $rootScope.onOnline, false);

        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          $rootScope.currentPosition = position;
        }, function(err) {
          // error
        });

    });





          var watchOptions = {
            timeout : 3000,
            enableHighAccuracy: false // may cause errors if true
          };

          var watch = $cordovaGeolocation.watchPosition(watchOptions);
          watch.then(
            null,
            function(err) {
              // error
            },
            function(position) {
                $rootScope.currentPosition = position;
          });




        $http.defaults.useXDomain = true;
        delete $http.defaults.headers.common['X-Requested-With'];


        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }


        $rootScope.$on('$stateChangeStart', function(event, toState, fromState) {
            var loggedIn = $rootScope.globals.currentUser;
            $rootScope.loggedIn = loggedIn != null;

                if (toState.module === 'private' && !loggedIn) {

                    //redirectToUrlAfterLogin.url = toState.url;
                    // If logged out and transitioning to a logged in page:
                    event.preventDefault();
                    $state.go('app.login');
                } 


                /*else if (toState.module === 'public' && loggedIn) {
                    // If logged in and transitioning to a logged out page:
                    event.preventDefault();
                    $state.go('app.profile');
                };*/

        });

 }


config.$inject = ['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$httpProvider','$mdThemingProvider','$mdDateLocaleProvider','$mdGestureProvider'];
function config($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, $mdThemingProvider,$mdDateLocaleProvider,$mdGestureProvider) 
{

    // Configure a dark theme with primary foreground yellow
    $mdThemingProvider.theme('docs-dark', 'default')
      .primaryPalette('green')
      .backgroundPalette('green');

      // Configure a dark theme with primary foreground yellow
    $mdThemingProvider.theme('docs-light', 'default')
      .primaryPalette('green')

    
    $mdDateLocaleProvider.formatDate = function(date) {
       return moment(date).format('DD-MM-YYYY');
    };

    $mdGestureProvider.skipClickHijack();
   
    // Turn off caching for demo simplicity's sake
    $ionicConfigProvider.views.maxCache(2);

    //Perfomance Improvement using Native Scrolling instead of JS Scrolling
    //$ionicConfigProvider.scrolling.jsScrolling(false);

    /*
    // Turn off back button text
    $ionicConfigProvider.backButton.previousTitleText(false);
    */

    $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl',
        module:'public'
    })

    .state('app.activity', {
        cache:false,
        url: '/activity',
        views: {
            'menuContent': {
                templateUrl: 'templates/activity.html',
                controller: 'ActivityCtrl'
            },
            'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-bottom-right expanded button-balanced spin" ui-sref="app.mapresults"><i class="icon ion-map"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);
                }
            }
        },
        module:'private'
    })

    .state('app.favorites', {
        cache:false,
        url: '/favorites',
        views: {
            'menuContent': {
                templateUrl: 'templates/favoritedoctors.html',
                controller: 'FavoriteCtrl'
            },'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-bottom-right expanded button-balanced spin" ui-sref="app.searchdoctors"><i class="icon ion-search"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);
                }
            }
        },
        module:'private'
    })

    .state('app.mapresults', {
        url: '/mapresults',
        views: {
            'menuContent': {
                templateUrl: 'templates/mapresults.html',
                controller: 'ActivityMapCtrl'
            },
            'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-bottom-right expanded button-balanced spin" ui-sref="app.activity"><i class="icon ion-ios-list-outline"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);
                }
            }
        },
        module:'private'
    })

    .state('app.singlemap', {
        url: '/singlemap/:loc_id',
        views: {
            'menuContent': {
                templateUrl: 'templates/singlemap.html',
                controller: 'DoctorMapCtrl'
            },
            'fabContent': {
                template: ''
            }
        },
        module:'private'
    })

    .state('app.friends', {
        url: '/friends',
        views: {
            'menuContent': {
                templateUrl: 'templates/friends.html',
                controller: 'FriendsCtrl'
            },
            'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-bottom-right expanded button-calm-900 spin" ui-sref="app.addmember({mbr_id: 0,formop:\'Add New\'})"><i class="icon ion-person-add"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);
                }
            }
        },
        module:'private'
    })


    .state('app.addmember', {
        url: '/addmember/:mbr_id/:formop',
        views: {
            'menuContent': {
                templateUrl: 'templates/addmember.html',
                controller: 'MemberCtrl'
            },
            'fabContent': {
                template: ''
            }
        },
        module:'private'
    })

    .state('app.gallery', {
        cache:false,
        url: '/gallery',
        views: {
            'menuContent': {
                templateUrl: 'templates/gallery.html',
                controller: 'GalleryCtrl'
            },
            'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-bottom-right expanded button-calm-900 spin" ui-sref="app.addmember({mbr_id: 0,formop:\'Add New\'})"><i class="icon ion-person-add"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);
                }
            }
        },
        module:'private'
    })

    .state('app.login', {
        url: '/login',
        views: {
            'menuContent': {
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            },
            'fabContent': {
                template: ''
            }
        },
        module:'public'
    })

    .state('app.register', {
        url: '/register/:formop',
        views: {
            'menuContent': {
                templateUrl: 'templates/register.html',
                controller: 'RegisterCtrl'
            },
            'fabContent': {
                template: ''
            }
        },
        module:'public'
    })

    .state('app.forgetpassword', {
        url: '/forgetpassword',
        views: {
            'menuContent': {
                templateUrl: 'templates/forgetpassword.html',
                controller: 'RegisterCtrl'
            },
            'fabContent': {
                template: ''
            }
        },
        module:'public'
    })

    .state('app.verify', {
        url: '/verify',
        views: {
            'menuContent': {
                templateUrl: 'templates/verification.html',
                controller: 'RegisterCtrl'
            },
            'fabContent': {
                template: ''
            }
        },
        module:'public'
    })

    .state('app.profile', {
        cache:false,
        url: '/profile',
        views: {
            'menuContent': {
                templateUrl: 'templates/profile.html',
                controller: 'ProfileCtrl'
            },
            'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-top-right expanded button-assertive spin" ui-sref="app.favorites"><i class="icon ion-star"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);
                }
            }
        },
        module:'private'
    })

    .state('app.searchdoctors', {
        url: '/searchdoctors',
        views: {
            'menuContent': {
                templateUrl: 'templates/searchdoctors.html',
                controller: 'SearchCtrl'
            },'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-top-right expanded button-assertive spin" ui-sref="app.favorites"><i class="icon ion-star"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);
                }
            }
           
        },
        module:'public'
    })

    

    .state('app.doctorinfo', {
        cache:false,
        url: '/doctorinfo/:loc_id',
        views: {
            'menuContent': {
                templateUrl: 'templates/doctorinfo.html',
                controller: 'DoctorCtrl'
            },'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-top-right expanded button-calm-900 spin" ng-click="phonecallTab(918100014622)" ><i class="icon ion-ios-telephone-outline"></i></button>',
                controller: function ($timeout,$scope) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);

                    $scope.phonecallTab = function ( phonenumber ) {
                        var call = "tel:+" + phonenumber;
                        alert('Calling Support'); //Alert notification is displayed on mobile, so function is triggered correctly!
                        document.location.href = call;
                    }
                }
            }
           
           
        },
        module:'public'
    })

    .state('app.bookappointment', {
        cache:false,
        url: '/bookappointment/:loc_id',
        views: {
            'menuContent': {
                templateUrl: 'templates/bookappointment.html',
                controller: 'AppointmentScheduleCtrl'
            },'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-bottom-right expanded button-calm-900 spin" ng-click="phonecallTab(918100014622)"><i class="icon ion-ios-telephone-outline"></i></button>',
                controller: function ($timeout,$scope) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);

                    $scope.phonecallTab = function ( phonenumber ) {
                        var call = "tel:+" + phonenumber;
                        alert('Calling Support'); //Alert notification is displayed on mobile, so function is triggered correctly!
                        document.location.href = call;
                    }
                }
            }
           
           
        },
        module:'public'
    })

    .state('app.appointmentdetails', {
        cache:false,
        url: '/appointment/:btime/:bdate',
        views: {
            'menuContent': {
                templateUrl: 'templates/appointmentdetails.html',
                controller: 'AppointmentCtrl'
            },'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-bottom-right expanded button-calm-900 spin" ui-sref="app.addmember({mbr_id: 0,formop:\'Add New\'})"><i class="icon ion-person-add"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);
                }
            }
           
           
        },
        module:'public'
    })
    
    .state('app.appointmenthistory', {
        url: '/appointmenthistory/:mbr_id',
        views: {
            'menuContent': {
                templateUrl: 'templates/appointmenthistory.html',
                controller: 'AppointmentHistoryCtrl'
            },'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-bottom-right expanded button-balanced spin" ui-sref="app.searchdoctors"><i class="icon ion-search"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);
                }
            }
           
           
        },
        module:'public'
    })
    
    

    .state('app.contact', {
        url: '/contact',
        views: {
            'menuContent': {
                templateUrl: 'templates/contact.html',
                controller: 'ContactCtrl'
            },'fabContent': {
                template: '<button id="fab-members" class="button button-fab button-fab-bottom-right expanded button-calm-900 spin" ng-click="phonecallTab(918100014622)"><i class="icon ion-ios-telephone-outline"></i></button>',
                controller: function ($timeout,$scope) {
                    $timeout(function () {
                        document.getElementById('fab-members').classList.toggle('on');
                    }, 900);

                    $scope.phonecallTab = function ( phonenumber ) {
                        var call = "tel:+" + phonenumber;
                        alert('Calling Support'); //Alert notification is displayed on mobile, so function is triggered correctly!
                        document.location.href = call;
                    }
                }
            }
           
        },
        module:'public'
    })
    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/login');

    /* CORS... */
      /* http://stackoverflow.com/questions/17289195/angularjs-post-data-to-external-rest-api */
      $httpProvider.defaults.useXDomain = true;
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
}


 //where we will store the attempted url
app.value('redirectToUrlAfterLogin', { url: '/' });

app.constant('SERVER', {
  // if using local server
  //url: 'http://localhost:3000'

  // if using our public azure server
  url: 'http://pvservices.azurewebsites.net'

});

app.constant('KEYS', {
  SCHEDULEKEY : 'schedulekey',
  SEARCHRESULTKEY : 'searchresultkey',
  STARREDKEY : 'starredkey',
  SEARCHKEY : 'searchkey',
  DOCTORKEY : 'doctorkey',
  MEMBERKEY : 'memberkey',
  PROFILEKEY: 'profilekey',
  CITYKEY:'citykey'
});

