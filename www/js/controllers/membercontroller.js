
app.controller('GalleryCtrl', function($scope, $stateParams, $ionicModal, $timeout, $ionicNavBarDelegate,$rootScope,$ionicPopup, $cordovaCamera,$localstorage,KEYS, ionicMaterialInk, ionicMaterialMotion,MemberParentFactory, ServerService) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $ionicNavBarDelegate.showBackButton(true);
    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);

    ionicMaterialInk.displayEffect();

    

    (function initController() {
           
                loadMembers();

    })();

    function loadMembers() {
          if($scope.show("Loading Members") == false)
            return;

           if(!isEmpty($localstorage.getObject(KEYS.MEMBERKEY)))
           {
                $scope.members = $localstorage.getObject(KEYS.MEMBERKEY);
                LoadPrescriptions();
                $scope.hide();
            }
            else{

              $scope.members = [];

                      MemberParentFactory.query({reg_user_id: $rootScope.reg_user_id}).then(function (response) {   
                      if (response.length > 0)
                      {
                          $scope.members = response.result;
                          $localstorage.setObject(KEYS.MEMBERKEY,$scope.members);

                          LoadPrescriptions();
                      }

                       $scope.hide();
                       
                      });
            }
    }

    function LoadPrescriptions() {
      $scope.photos=[];
      ServerService.getImage($rootScope.reg_user_id, $rootScope.reg_user_id, fileFetched); 
    };


     function fileFetched (r) {
      if(r.success)
      {
        $scope.photos=[];

          var counter = r.result.length;
          for (var i = 0; i < counter; i++) {

            var parts = r.result[i].name.split("_");

            //console.log(r.result[i]);
                  $scope.photos.push({mbr_id:parts[2], src: r.url + r.result[i].name, desc: r.result[i].name, lastmodified: r.result[i].properties['last-modified']})
            }
      }

    }


    $scope.openModalPU = function(mbr_id) {
        $scope.currentMemberID = mbr_id;
        $scope.imgURI = undefined;
        $ionicModal.fromTemplateUrl('templates/uploadprescription.html', {
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal) {
        $scope.uploadModal = modal;
        $scope.uploadModal.show();
        });
      };

      $scope.openModalPV = function(moddate,imgsrc) {
        $ionicModal.fromTemplateUrl('templates/prescriptionview.html', {
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal) {

        $scope.imgsrc = imgsrc;
        $scope.moddate = moddate;

        $scope.modal = modal;
        $scope.modal.show();
        });
      };


      $scope.takePhoto = function () {
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
            });
        }
        
        $scope.choosePhoto = function () {
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
            });
        }

    $scope.uploadPrescription = function () {

      if($scope.show("Uploading Prescription ...") == false)
        return;

      var img = document.getElementById('prescriptionImageUpload');
      var imageURI = img.src;
      ServerService.uploadImage(imageURI, prescriptionUploaded, errHandlerPrescription, $rootScope.reg_user_id, $scope.currentMemberID, "Prescription"); 
    };

    function prescriptionUploaded (r) {
        $scope.hide();
        $scope.showalertPopup('Success', 'Prescription uploaded successfully!');
        LoadPrescriptions();
        $scope.uploadModal.hide();
        
    }
    function errHandlerPrescription(err){
        $scope.hide();
        $scope.showalertPopup('Failed', 'Prescription upload failed!' + JSON.stringify(err));
        console.log(err);
        
    }

  
  $scope.toggleGroup = function(mbr_id) {
    if ($scope.isGroupShown(mbr_id)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = mbr_id;
    }
  };
  $scope.isGroupShown = function(mbr_id) {
    return $scope.shownGroup === mbr_id;
  };


    $scope.deletePrescription = function (filename) {


            $ionicPopup.confirm({
                  title: 'Delete Prescription',
                  content: 'Are you sure you want to delete this prescription?'
                })
                .then(function(result) {
                  if(result) {

                    if($scope.show("Deleting Prescription...") == false)
                        return;
                    //Do delete
                    ServerService.deleteImage($rootScope.reg_user_id, filename, fileDeleted); 
                  }
                });
    };

    function fileDeleted (r) {
        $scope.hide();
        $scope.showalertPopup('Success','Prescription deleted successfully!');
        LoadPrescriptions();
        
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
                            $localstorage.setObject(KEYS.MEMBERKEY,[]);
                          }

                          $scope.hide();
                      });

                  }
                });
        }

})

.controller('MemberCtrl', function($scope, $state, $stateParams, $timeout,$ionicNavBarDelegate,$ionicPopup,$localstorage,KEYS, ionicMaterialInk, ionicMaterialMotion, MemberParentFactory,MemberFactory,MembersFactory, $rootScope) {
    
     
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
    //ionicMaterialMotion.fadeSlideInRight();

    // Set Ink
    ionicMaterialInk.displayEffect();

    (function initController() {
            setMember($stateParams.mbr_id, $stateParams.formop);
    })();

    function setMember(mbr_id, formop)
    {
            $scope.formop = formop;
            $scope.currentMemberID = mbr_id;

            if(formop == 'Edit'){

                loadMember(mbr_id);
            }
            else if(formop == 'Add New')
            {
                $scope.member = {"mbr_id":null,"mbr_name":"","mbr_email":"","mbr_mobile":"","mbr_city":"","mbr_relation":"","mbr_dob":'',"reg_user_id":null};
                console.log('Add New' + $scope.member);
            }

            
      }

    function loadMember(mbr_id) {
          if($scope.show("Loading Member Information") == false)
            return;

            MemberFactory.show({ id: mbr_id}).$promise.then(function (response) {   
              if (response.success){
                   $scope.member = response.result;
                   $scope.member.mbr_dob = new Date($scope.member.mbr_dob);
               }
                 $scope.hide();
            });
    }

    
    $scope.createNewMember = function (form) {


        if(form.$valid) {
   
                 if($scope.show("Please wait: Saving Member Information...")==false)
                    return;

                  $scope.member.reg_user_id = $rootScope.reg_user_id;
                  $scope.member.mbr_dob = moment($scope.member.mbr_dob).format('DD/MM/YYYY');

                      MembersFactory.create($scope.member).then(function(response) {
                        
                        
                            if (response.length > 0) {
                            
                                $scope.showalertPopup('Success' + response,'Member details saved successfully!');
                                $localstorage.setObject(KEYS.MEMBERKEY,[]);
                                $state.go('app.gallery');
                            }

                            $scope.hide();
                           
                        }).catch(function(e){
                          $scope.showalertPopup(e, "error");
                        });


        }
    }


      $scope.editMember = function (form) {

            if(form.$valid) {
                  if($scope.show("Please wait: Saving Member Information...") == false)
                    return;

                        
                  $scope.member.reg_user_id = $rootScope.reg_user_id;
                  $scope.member.mbr_id = $scope.currentMemberID ;
                  
                  $scope.member.mbr_dob = moment($scope.member.mbr_dob).format('DD/MM/YYYY');

                      MembersFactory.update($scope.member).$promise.then(function(response) {
                        $scope.hide();
                        
                        if (!response.success) {
                                 $scope.showalertPopup('Failed',response.message);
                            } else {
                              $scope.showalertPopup('Success','Member details saved successfully!', function(response){
                                    $localstorage.setObject(KEYS.MEMBERKEY,[]);
                                    $state.go('app.gallery');

                              });
                              
                            }
                         
                        });
            }
        }

})

app.controller('AppointmentCtrl', function($scope,$state, $stateParams, $timeout,$ionicNavBarDelegate,$filter,$ionicPopup, Events, ionicMaterialMotion, ionicMaterialInk,$localstorage,KEYS, AppointmentFactory) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $ionicNavBarDelegate.showBackButton(true);
    // Activate ink for controller
    ionicMaterialInk.displayEffect();

    


  (function initController() {

           $scope.members = $localstorage.getObject(KEYS.MEMBERKEY);
           $scope.currentdoctor = $localstorage.getObject(KEYS.DOCTORKEY);    
            
           $scope.appointment = {apt_doctor: $scope.currentdoctor.results.first_name + " " + $scope.currentdoctor.results.last_name, apt_date: $stateParams.bdate,apt_time: $stateParams.btime, reminder:false};           
            
    })();


    $scope.bookAppointment = function(form){
        if(form.$valid) {
                  if($scope.show("Please wait: Saving Appointment details...") == false)
                    return;
                            var loc_id = $scope.currentdoctor.results.loc_id;
                            var mbr_id = $scope.appointment.apt_mbr_name; 
                            var mbr = $filter('filter')($scope.members, function (d) {return d.mbr_id == mbr_id;})[0];
                            var reg_id = mbr.reg_user_id;
                            var apt_date = moment($scope.appointment.apt_date,'DD-MM-YYYY').format('DD/MM/YYYY');  
                            var apt_time = $scope.appointment.apt_time; 
                            var doc_name = $scope.currentdoctor.results.first_name + " " + $scope.currentdoctor.results.last_name;

                      var tquery = ({locationid: loc_id, userid:reg_id , memberid:mbr_id , mbrname: mbr.mbr_name, aptdate: apt_date, apttime: apt_time, doctor_name: doc_name  });

                      console.log(tquery);

                        AppointmentFactory.bookAppointment.save(tquery).$promise.then(function(response) {
                        $scope.hide();
                        
                        if (!response.success) {
                                 $scope.showalertPopup('Failed',response.message);
                            } else {

                              if( $scope.appointment.reminder)
                              {
                                  var event = {title:"Appointment with Dr. " + doc_name,
                                  location:$scope.currentdoctor.results.address + ", " + $scope.currentdoctor.results.city,
                                  description: "Appointment for " + mbr.mbr_name + " on " + apt_date + " at " + apt_time + " hours",
                                  date: moment($scope.appointment.apt_date,'DD-MM-YYYY'),
                                  enddate:moment($scope.appointment.apt_date,'DD-MM-YYYY')};

                                  addEvent(event);
                                
                              }

                              $scope.showalertPopup('Success','Appointment booked successfully!', function(res){
                                $state.go('app.appointmenthistory');
                              });
                              
                            }
                         
                        });
        }
    }


    function addEvent(event)
    {
        Events.add(event).then(function(result) {
        console.log("done adding event, result is "+result);
        if(result === 1) {
          //update the event
          $timeout(function() {
            $scope.events[idx].status = true;
            $scope.$apply();
          });
        } else {
          //For now... maybe just tell the user it didn't work?
        }
        });
    }

})

app.controller('AppointmentHistoryCtrl', function($scope,$state,$rootScope, $stateParams, $timeout,$ionicNavBarDelegate,$filter,$ionicPopup, ionicMaterialMotion, ionicMaterialInk,$localstorage,KEYS, AppointmentFactory) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $ionicNavBarDelegate.showBackButton(true);
    // Activate ink for controller
    ionicMaterialInk.displayEffect();

    


  (function initController() {

      loadAppointments($stateParams.mbr_id);          
            
    })();


    function loadAppointments(mbr_id){


                  if($scope.show("Please wait: Loading Appointments...") == false)
                    return;
                      var tquery = ({reg_id: $rootScope.reg_user_id});

                      console.log(tquery);

                        AppointmentFactory.getAppointmentHistory.query(tquery).$promise.then(function(response) {
                           $scope.hide();
                        
                            if (response.success) {

                              if(mbr_id)
                              {
                                
                                $scope.appointments = $filter('filter')(response.result, function (d) {return d.mbr_id == mbr_id && new Date(d.appointment_date) >= new Date(moment().subtract(1,'d'));});
   
                              }
                              else
                              {
                                $scope.appointments = $filter('filter')(response.result, function (d) {return new Date(d.appointment_date) >= new Date(moment().subtract(1,'d'));});
                              }
                              
                            }
                         
                        });
        
    }

    $scope.cancelAppointment = function(appointmentid, apt_date,apt_time,doc_name){
        
                $ionicPopup.confirm({
                  title: 'Cancel Appointment',
                  content: 'Are you sure you want to cancel this appointment?'
                })
                .then(function(result) {
                  if(result) {

                  if($scope.show("Please wait: Cancelling Appointment...") == false)
                    return;
                      var tquery = ({appointmentid: appointmentid, reg_user_id: $rootScope.reg_user_id, aptdate: moment(apt_date).format('DD-MM-YYYY'), apttime: apt_time, doctor_name: doc_name});

                      console.log(tquery);

                        AppointmentFactory.cancelAppointment.save(tquery).$promise.then(function(response) {
                        $scope.hide();
                        
                        if (!response.success) {
                                 $scope.showalertPopup('Failed',response.message);
                            } else {

                              $scope.showalertPopup('Success','Appointment cancelled successfully!', function(res){
                                loadAppointments();
                              });
                              
                            }
                         
                        });
                      }
                    });
    }

    

})


;