(function () {
    'use strict';

    angular
        .module('pvapp')
        .factory('ServerService', ServerService);

        ServerService.$inject = ['SERVER', '$http', '$q'];

        function ServerService(SERVER, $http, $q){

        //Server URL
        var baseUrl = SERVER.url;

    
        function getFileUploadOptions(imageURI, reg_user_id, mbr_id,optype) {
          var options = new FileUploadOptions();
            var date = new Date();
            var n = date.getMilliseconds();
            options.fileKey = "part";

            if(optype == 'Prescription')
              options.fileName = "prescription_" + reg_user_id + "_"+ mbr_id +"_"+ n +".jpg" ;
            else
              options.fileName = "profile_" + reg_user_id +"_pic" + ".jpg" ;

            options.mimeType = "image/jpeg";
            var params = new Object();
            options.params = params;
            options.chunkedMode = false;
          return options;
        }

        return {
          uploadImage: function (imageURI, onSuccess, onError, reg_user_id, mbr_id, optype) {

              var ft =  new FileTransfer();
              ft.upload(imageURI, encodeURI(baseUrl + "/pv/web/prescription/upload"), onSuccess, onError, getFileUploadOptions(imageURI, reg_user_id, mbr_id,optype));
             

            },
          getImage:function(reg_user_id, mbr_id, callback)
          {
            var deferred = $q.defer();

            $http.get('data/Users.json').then(function(response) {

                  var userFound = null;
                angular.forEach(response.data, function(user) {
                        if(angular.lowercase(user.id) == reg_user_id){
                            user.username = user.email; 
                            userFound = user;                                                     
                        }
                 }, userFound);

                 deferred.resolve(userFound.picture);                  
            }).catch(function (e) {
                 deferred.reject(e);
            });

            return deferred.promise;

                /*$http.post(baseUrl + '/pv/web/prescription/view', { userid: reg_user_id, mbr_id: mbr_id })
                .success(function (response) {
                   callback(response);
                });*/
          },
          deleteImage:function(reg_user_id, filename, callback)
          {
                $http.post(baseUrl + '/pv/web/prescription/delete', { userid: reg_user_id, filename: filename})
                .success(function (response) {
                   callback(response);
                });
          }
        };
        

    }



})();