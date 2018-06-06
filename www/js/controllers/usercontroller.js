






app.controller('LoginCtrl',['$scope','$state','$timeout', '$stateParams', 'ionicMaterialInk','AuthenticationService', '$ionicPopup','redirectToUrlAfterLogin','$rootScope','$cookieStore','$cordovaVibration','$localstorage','KEYS',
 function($scope,$state,$timeout, $stateParams, ionicMaterialInk,AuthenticationService, $ionicPopup, redirectToUrlAfterLogin, $rootScope, $cookieStore,$cordovaVibration, $localstorage, KEYS) {
    $scope.$parent.clearFabs();
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 300);
    ionicMaterialInk.displayEffect();

    $scope.data = {};

    (function initController() {

        $scope.show("Please wait while application is Loading..");
        //Check if the user is already logged in
        if(!isEmpty($localstorage.getObject(KEYS.PROFILEKEY)))
        {
                  $scope.user = $localstorage.getObject(KEYS.PROFILEKEY);
                  $rootScope.reg_user_id = $scope.user.id; 
                  AuthenticationService.SetCredentials($scope.user.email,$scope.user.pwd);
                  $scope.$parent.showHeader();
                  $state.go('app.profile');

        }
        else
        {

            // keep user logged in after page refresh
            $rootScope.globals = $cookieStore.get('globals') || {};
            if ($rootScope.globals.currentUser) {
                $scope.data.username = $rootScope.globals.currentUser.username;
            }
                // reset login status
                AuthenticationService.ClearCredentials();
        }

        $scope.hide();
        
    })();

 
    $scope.login = function(form) {
        
        if(form.$valid) {

        if($scope.show("Please wait while we validate your credentials.") == false)
            return;

        console.log("LOGIN user: " + $scope.data.username + " - PW: " + $scope.data.password);
            AuthenticationService.Login(angular.lowercase($scope.data.username), $scope.data.password).then(function (response) {

                    $scope.data.username = response.username;

                    AuthenticationService.SetCredentials($scope.data.username, $scope.data.password);

                    $localstorage.clear();

                     // var returnUrl = redirectToUrlAfterLogin.url;
                      
                      //if (returnUrl) {
                          //console.log('Redirect to:' + returnUrl);
                          //if(returnUrl == "/")

                          //Force Load profile Picture 
                            $rootScope.photo = {};       
                            $state.go('app.profile');
                          //else
                            //$location.path(decodeURI(returnUrl)); // <- executed first, but not redirect directly.
                      //} else { //else :)
                        // console.log('Redirect returnUrl not found. Directing to "/welcome".');
                         //$state.go('app.profile'); // <- only redirect if no returnUrl isset/true
                     //}
                
                $scope.hide();
                
            }).catch(function (error) {
              
               $scope.showalertPopup('Login failed!','Please check your credentials!');
               $scope.hide();
               $cordovaVibration.vibrate(200);
            });

            
        }


    }


    $scope.forgetPassword = function(form) {


                if(form.$valid) {

               if( $scope.show("Please wait while verification is in progress.") == false)
                return;

                    AuthenticationService.ForgotPassword(angular.lowercase($scope.data.username), function (response) {
                    if (response.success) {
                           $scope.data.username = response.username;
                           $scope.showalertPopup('Success','Password has been sent in your registered email!');

                    } else {

                        $scope.showalertPopup('Login failed!','Please check your credentials!');
                    }

                    $scope.hide();
                    
                    });

            }
        }




}])


.controller('RegisterCtrl',['$scope','$state','$timeout', '$stateParams', 'ionicMaterialInk','$ionicPopup','UsersFactory','$rootScope', '$ionicModal','$localstorage', 'PasswordFactory', 'KEYS',
    function($scope,$state,$timeout, $stateParams, ionicMaterialInk,$ionicPopup,UsersFactory,$rootScope,$ionicModal, $localstorage, PasswordFactory, KEYS) {
    
    $scope.$parent.clearFabs();

    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();

    


    $scope.data = $localstorage.getObject(KEYS.PROFILEKEY);

    if($stateParams.formop == 'New')
    {
        $scope.data = {};
        $localstorage.clear();
    }

      $scope.openModalTNC = function() {
        $ionicModal.fromTemplateUrl('templates/terms_n_conditions.html', {
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
        });
      };

      $scope.openModalPP = function() {
        $ionicModal.fromTemplateUrl('templates/privacy_policy.html', {
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
        });
      };
      

    $scope.forgetPassword = function(form) {

            if(form.$valid) {
                if($scope.show("Please wait while we verify your email.") == false)
                        return;

                    $scope.data.email = angular.lowercase($scope.data.email);
                    $scope.data.op = 'ForgotPassword';

                    PasswordFactory.act($scope.data).$promise.then(function (response) {  

                    if (!response.success) 
                        $scope.showalertPopup('Failed', response.message);
                    else
                       $scope.showalertPopup('Success',response.message);

                       $scope.hide();
                    }).catch(function onReject(err) {
                        console.log('FAILED', err)
                        $scope.showalertPopup('Verification failed!','Failed verifying information!');
                        $scope.hide();
                    });
                }
    }

    $scope.verifyEmail = function(form) {

                if(form.$valid) {
                    if($scope.show("Please wait while verification is in progress.") == false)
                        return;

                    $scope.data.email = angular.lowercase($scope.data.email);
                    $scope.data.op = 'Verification';

                    PasswordFactory.act($scope.data).$promise.then(function (response) {   

                    if (!response.success) 
                        $scope.showalertPopup('Failed', response.message);
                    else
                    {
                       $scope.showalertPopup('Success',response.message);
                       $state.go('app.login');
                    }

                       $scope.hide();
                    }).catch(function onReject(err) {
                        console.log('FAILED', err)
                        $scope.showalertPopup('Verification failed!','Failed verifying information!');
                        $scope.hide();
                    });
            }
    }

      

    $scope.register = function(form) {

        if(form.$valid) {
        if($scope.show("Please wait while registration is in progress.") == false)
            return;

            $scope.data.email = angular.lowercase($scope.data.email);


            

          UsersFactory.create($scope.data).$promise.then(function(response) {
            if (!response.success) {
                $scope.showalertPopup('Failed', response.message);
                } else {

                  $scope.data.pwd = '';
                  $localstorage.setObject(KEYS.USERKEY, $scope.data);

                  $scope.showalertPopup('Success', 'An email with  verification code has been sent to your registred email address. <br/>Please check your email.');
                  $state.go('app.verify');
                }

                $scope.hide();

          });
    
        }
    }

}])

.controller('ProfileCtrl', function($scope,$rootScope, $stateParams, $timeout,$ionicHistory,$ionicNavBarDelegate,$ionicModal, $ionicPopover, $localstorage,$cordovaCamera,$filter, ionicMaterialMotion, ionicMaterialInk, HomeFactory,MemberParentFactory, UserFactory,TypeaheadFactory, ConnectivityMonitor,ServerService, KEYS) {

    $ionicHistory.clearHistory();
    // Set Header
    $timeout(function() {
        $scope.$parent.showHeader();
    }, 100);
    
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab('right');

    $ionicNavBarDelegate.showBackButton(false);

    // Set Motion
    $timeout(function() {
        ionicMaterialMotion.slideUp({
            selector: '.slide-up',
            startVelocity: 3000
        });
    }, 50);

    $timeout(function() {
        ionicMaterialMotion.fadeSlideInRight({
            startVelocity: 3000
        });
    }, 700);

    // Set Ink
    ionicMaterialInk.displayEffect();


       	$scope.user = {city:'Loading...'};
        $scope.members = [];

        
        (function initController() {
          loadCity();
          $scope.user = $localstorage.getObject(KEYS.PROFILEKEY);
            if(!isEmpty($scope.user)){
              $rootScope.reg_user_id = $scope.user.id;
              LoadProfilePhoto();
            }
            else
            {

                $scope.show("Loading User Information");
                         loadCurrentUser();
                          $scope.hide();
		        }    

        })();


        function loadCurrentUser() {

          if($scope.show("Loading User Information for " + $rootScope.globals.currentUser.username) == false)
            return;

            HomeFactory.getCurrentUser($rootScope.globals.currentUser.username).then(function (user) {

                  $localstorage.setObject(KEYS.PROFILEKEY, user);  
                  $scope.user = user;
                  $rootScope.reg_user_id = $scope.user.id; 
                  $rootScope.photo={};
                  LoadProfilePhoto();
                  $scope.hide();

            }).catch(function onReject(err) {
                console.log('FAILED', err)
                $scope.showalertPopup('Loading failed!','Failed Loading User Information!');
                $scope.hide();
            });
        }


        function loadMembers()
        {
           if(!isEmpty($localstorage.getObject(KEYS.MEMBERKEY)))
           {
                $scope.members = $localstorage.getObject(KEYS.MEMBERKEY);
           }
            else{

                      MemberParentFactory.query({reg_user_id: $rootScope.reg_user_id}).then(function (response) {   
                      if (response.length > 0)
                      {
                          $scope.members = response.result;
                          $localstorage.setObject(KEYS.MEMBERKEY,$scope.members);
                      }                  

                      });
            }
        }


    function LoadProfilePhoto() {

      $scope.photo={src: "img/service-bg1.png", desc: "img/service-bg1.png"};
      if(isEmpty($rootScope.photo))
        ServerService.getImage($rootScope.reg_user_id, $rootScope.reg_user_id, fileFetched).then(fileFetched); 
      else
        $scope.photo = $rootScope.photo;

       //we have user id now keep information ready for appointment booking where member details are required
            loadMembers();

    };


     function fileFetched (r) {
      if(r.length > 0)
      {
          $scope.photos=[];
          var counter = r.length;

          for (var i = 0; i < counter; i++) {
              $scope.photos.push({src: r, desc: r});
            }
        }

        if($scope.photos.length ==0)
          $scope.photo = {src: "img/family.jpg", desc: "img/family.jpg"};
        else
          $scope.photo = $scope.photos[0];

        $rootScope.photo = $scope.photo;
       
    }

      
      

      $scope.showPopover = function($event){
        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
             popover.show($event);
        });
      }   





      $scope.openModalPV = function(imgsrc) {
        $ionicModal.fromTemplateUrl('templates/prescriptionview.html', {
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal) {

        $scope.imgsrc = imgsrc;
        $scope.moddate = 'Profile Picture';
        $scope.showchangebutton = true;

        $scope.modal = modal;
        $scope.modal.show();

        });
      }; 

      $scope.openModalPU = function(reg_user_id) {
        $scope.imgURI = undefined;
        $ionicModal.fromTemplateUrl('templates/uploadprofilepicture.html', {
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.uploadModal = modal;
          $scope.uploadModal.show();
        });
      };

      $scope.takeProfilePhoto = function () {
          var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 400,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

            $cordovaCamera.getPicture(options).then(function (imageData) {
                $scope.imgURI = "data:image/jpeg;base64," + imageData;
            }, function (err) {
                // An error occured. Show a message to the user
                alert(err);
            });
        }
        
        $scope.chooseProfilePhoto = function () {
          var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 400,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

            $cordovaCamera.getPicture(options).then(function (imageData) {
                $scope.imgURI = "data:image/jpeg;base64," + imageData;
            }, function (err) {
                // An error occured. Show a message to the user
                alert(err);
            });
        }

    $scope.uploadProfilePhoto = function () {

      if($scope.show("Uploading Photo ...") == false)
        return;

      var img = document.getElementById('prescriptionImageUpload');
      var imageURI = img.src;
      ServerService.uploadImage(imageURI, fileUploaded, errHandler, $rootScope.reg_user_id, $scope.currentMemberID, "Profile"); 
    };

    function fileUploaded (r) {
        $scope.hide();
        $scope.showalertPopup('Success', 'Profile photo uploaded successfully!');
        $rootScope.photo = '';
        LoadProfilePhoto();
        $scope.uploadModal.hide();
        $scope.modal.hide();
        
    }
    function errHandler(err){
        $scope.hide();
        $scope.showalertPopup('Failed', 'Profile photo upload failed!' + JSON.stringify(err));
        console.log(err);
        
    }


     function loadCity() {
     
      $scope.cities = $localstorage.getObject(KEYS.CITYKEY);

      var tquery = ({city:'', listname:'city'});

        $scope.cities.length ? null : TypeaheadFactory.query(tquery).then(function (response) {   
            if (response.length > 0)
                  $scope.cities = response;
                  $localstorage.getObject(KEYS.CITYKEY, $scope.cities);
            });
    }


    $scope.$watch('user.city', function(newVal, oldVal) {
      if (newVal !== oldVal) {
          var selected = $filter('filter')($scope.cities, {city: $scope.user.city});
          $scope.user.city = selected.length ? selected[0].city : null;
      }
    });

    $scope.showCity = function() {
      var selected = $filter('filter')($scope.cities, {city: $scope.user.city});
      return ($scope.user.city && selected.length) ? selected[0].city : 'Not set';
    };

      $scope.updateUser = function (inputfield, newvalue) {

        if($scope.show("Updating User Information for " + $rootScope.globals.currentUser.username) == false)
            return;

                      UserFactory.update({ id: $rootScope.reg_user_id, fieldname : inputfield, newvalue: newvalue}).$promise.then(function(response) {
                        $scope.hide();
                        
                        if (!response.success) {
                                 $scope.showalertPopup('Failed',response.message);
                            } else {

                              var msg;

                                switch(inputfield){
                                  case "reg_address" : msg = "Your city has been updated successfully!";
                                    break;
                                  case "reg_mobile" : msg = "Your Mobile number has been updated successfully!";
                                    break;
                                  case "reg_pass" : msg = "Your password changed successfully!";
                                    break;
                                  case "IsSubscribed" : msg = "Your subscription choice has been updated successfully!";
                                    break;
                                }

                              $scope.showalertPopup('Success',msg, function(response){

                                $localstorage.setObject(KEYS.PROFILEKEY, $scope.user);

                              });
                              
                            }
                         
                          })
                          .catch(function(error) {
                            $scope.showalertPopup('Failed',error.data);
                          })
                          .finally(function(result) {
                            $scope.hide();
                        })
                      ;
      }
  

      $scope.inputType = 'password';

      $scope.hideShowPassword = function(){
      if ($scope.inputType == 'password')
        $scope.inputType = 'text';
      else
        $scope.inputType = 'password';
      };

})



