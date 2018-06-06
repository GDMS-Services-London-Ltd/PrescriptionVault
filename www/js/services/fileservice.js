(function () {
    'use strict';

    angular
      .module('pvapp')
      .factory('$filestore', function($window){

        return {
        create: function(filename, jsonvalue) {
          $window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

              console.log('file system open: ' + fs.name);
              fs.root.getFile(filename, { create: true, exclusive: false }, function (fileEntry) {

                  console.log("fileEntry is file?" + fileEntry.isFile.toString());
                  // fileEntry.name == 'someFile.txt'
                  // fileEntry.fullPath == '/someFile.txt'
                  writeFile(fileEntry, null);

              }, onErrorCreateFile);

          }, onErrorLoadFs);
        },
        get: function(key, defaultValue) {
          return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
          $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
          return JSON.parse($window.localStorage[key] || '{}');
        },
        clear:function() {
          return $window.localStorage.clear();
        }
      }

        
    })

})();


// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}