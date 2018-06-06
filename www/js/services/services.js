'use strict';

var services = angular.module('pvapp.services',['ngResource']);

services.factory('HomeFactory', function ($q, $http, $resource, SERVER) {

        var service = {};
        service.getCurrentUser = getCurrentUser;

        return service;

    
    function getCurrentUser(username) {
         var deferred = $q.defer();

            $http.get('data/Users.json').then(function(response) {

                var userFound = null;
                angular.forEach(response.data, function(user) {
                        if(angular.lowercase(user.email) == username){
                            user.username = user.email; 
                            userFound = user;                                                     
                        }
                 }, userFound);

                if(userFound){
                    deferred.resolve(userFound);  
                }
                else{
                    deferred.reject("User Not Found!");
                }

            }).catch(function (e) {
                 deferred.reject(e);
            });

            return deferred.promise;
    }         

    /*return $resource(SERVER.url + '/pv/web/user/getbyusername/:username', {}, {
        query: { method: 'GET',params:{username: '@username'}}
    })*/
});

services.factory('PasswordFactory', function ($resource, SERVER) {

    return $resource(SERVER.url + '/pv/web/user/regverification', {}, {
        act: { method: 'POST'}
    })
});

services.factory('TypeaheadFactory', function ($q, $http, $resource, SERVER) {

     var service = {};
        service.query = query;

        return service;

    
    function query(query) {
         var deferred = $q.defer();

            if(query.listname == 'speciality'){

                $http.get('data/Specialty.json').then(function(response) {                       
                          deferred.resolve(response.data.specialty);                                                                  
                }).catch(function (e) {
                     deferred.reject(e);
                });

            }
            else
            {

                $http.get('data/Cities.json').then(function(response) {  

                        if(query.listname == 'city')
                        {
                            deferred.resolve(response.data);
                        }
                        else
                        {
                            var area = [];
                            angular.forEach(response.data, function(city) {
                                if(city.city == query.city)
                                {
                                    area = city.area;
                                }
                            });

                            deferred.resolve(area);
                        }

                                           
                }).catch(function (e) {
                     deferred.reject(e);
                });
            }

            return deferred.promise;
    }         
});


services.factory('MemberParentFactory', function ($q, $http, $resource,  SERVER) {

    var service = {};
        service.query = query;

        return service;

        function query(query) {
         var deferred = $q.defer();

            if(query.reg_user_id == 'speciality'){

                $http.get('data/Specialty.json').then(function(response) {                       
                          deferred.resolve(response.data.specialty);                                                                  
                }).catch(function (e) {
                     deferred.reject(e);
                });
            }
            else
            {
                deferred.resolve([]);
            }
            
            return deferred.promise;
    }   
});

services.factory('MembersFactory', function ($q, $cordovaFile, $ionicPlatform, $window, $resource,  SERVER) {

var service = {};
        service.create = create;
        service.update = update;

        return service;

        function create(query) {
            var deferred = $q.defer();

            $ionicPlatform.ready(function() {


                $cordovaFile.checkFile($window.cordova.file.externalRootDirectory + "/PrescriptionVault", "members.json")
                  .then(function (success) {
                    $cordovaFile.createFile($window.cordova.file.externalRootDirectory + "/PrescriptionVault", "members.json", true)
                        .then(function (success) {
                            // success
                            deferred.resolve("success" + $window.cordova.file.externalRootDirectory);
                        }, function (error) {
                            // error
                            deferred.reject("failed");
                        });   
                  }, function (error) {
                    // error
                  });                                    
            });

            return deferred.promise;
        } 

        function update(query) {
         var deferred = $q.defer();

            $filestore.create("test.txt", "test");
            
        return deferred.promise;
    }     
});

services.factory('MemberFactory', function ($resource,  SERVER) {
    return $resource(SERVER.url+ '/pv/web/members/:id', {}, {
        show: { method: 'GET' },
        delete: { method: 'DELETE', params: {id: '@id'}} 

    })
});



services.factory('MapFactory', function ($resource,  SERVER) {
    return $resource(SERVER.url + '/pv/web/doctors/location/:address', {}, {
        query: { method: 'GET',params:{address: '@address'}}
    })
});

services.factory('DoctorFactory', function ($q, $http, $timeout, $resource,  SERVER) {

    var service = {};
        service.query = query;

        return service;

     function query(query) {
         var deferred = $q.defer();

         $timeout( function(){

            if(query.searchby == 'speciality'){

                $http.get('data/Doctors.json').then(function(response) { 

                var doctorFound = [];
                        angular.forEach(response.data, function(doctor) {
                                if(doctor.results.speciality == query.speciality){                    
                                    doctorFound.push(doctor);                                                     
                                }
                         });

                          deferred.resolve(doctorFound);                                                                  
                }).catch(function (e) {
                     deferred.reject(e);
                });

            }

            if(query.searchby == 'name'){

                $http.get('data/Doctors.json').then(function(response) {                       
                          var doctorFound = [];
                        angular.forEach(response.data, function(doctor) {
                                if(angular.lowercase(doctor.results.first_name + " " + doctor.results.last_name).indexOf(angular.lowercase(query.fullname)) >= 0){                    
                                    doctorFound.push(doctor);                                                     
                                }
                         });

                          deferred.resolve(doctorFound);                                                                    
                }).catch(function (e) {
                     deferred.reject(e);
                });

            }

        },700);

            return deferred.promise;
        }
});

services.factory('AppointmentFactory', function ($resource,  SERVER) {
    return {
        getSchedule: $resource(SERVER.url + '/pv/web/getappointmentschedule', {}, {
            query: { method: 'POST'}
        }),
        bookAppointment: $resource(SERVER.url + '/pv/web/bookappointment', {}, {
            save: { method: 'POST'}
        }),
        cancelAppointment: $resource(SERVER.url + '/pv/web/cancelappointment', {}, {
            save: { method: 'POST'}
        }),
        getAppointmentHistory: $resource(SERVER.url + '/pv/web/getappointmenthistory', {}, {
            query: { method: 'POST'}
        })
    }
});


services.factory('UsersFactory', function ($resource,  SERVER) {
    return $resource(SERVER.url + '/pv/web/users', {}, {
        loadUsers: { method:'GET' },
        create: { method: 'POST' }
    })
});

services.factory('UserFactory', function ($resource,  SERVER) {
    return $resource(SERVER.url + '/pv/web/users/:id', {}, {
        show: { method: 'GET' },
        update: { method: 'PUT', params: {id: '@id'} },
        delete: { method: 'DELETE', params: {id: '@id'} }
    })
});

services.factory('Events', function($q,$cordovaCalendar) {
   
    var addEvent = function(event) {
        var deferred = $q.defer();

        $cordovaCalendar.createEvent({
            title: event.title,
            notes: event.description,
            location: event.location,
            startDate: event.date,
            endDate:event.enddate
        }).then(function (result) {
            console.log('success');console.dir(result);
            deferred.resolve(1);
        }, function (err) {
            console.log('error');console.dir(err);
            deferred.resolve(0);
        }); 
        
        return deferred.promise;

    }
    
    return {
        add:addEvent
    };

});
