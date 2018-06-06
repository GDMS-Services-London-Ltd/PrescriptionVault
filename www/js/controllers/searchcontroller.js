

function calculateDistance(position, items, $filter){

    if(!position.coords)
        return items;

            var glatlng1 = new google.maps.LatLng(position.coords.latitude,  position.coords.longitude);

            if(items.length > 0){

              items = _.map(items, function  (item) {

                    var glatlng2 = new google.maps.LatLng(item.results.latitude,  item.results.longitude);
                    var kmdistance = $filter('distance')(google.maps.geometry.spherical.computeDistanceBetween (glatlng1, glatlng2));
                    item.distance = kmdistance;
                    return item;
              });    
            }

            return items;
}


app.controller('ActivityCtrl', function($scope,$rootScope, $stateParams, $timeout,$ionicNavBarDelegate,$filter, ionicMaterialMotion, ionicMaterialInk,$localstorage,KEYS) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');
    $ionicNavBarDelegate.showBackButton(true);

    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
            selector: '.animate-fade-slide-in .item'
        });
    }, 200);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();

    $scope.user = $localstorage.getObject(KEYS.PROFILEKEY);
    $scope.search = $localstorage.getObject(KEYS.SEARCHKEY);
    $scope.searchresult = $localstorage.getObject(KEYS.SEARCHRESULTKEY);
    

    $scope.currentIndex = 0;
    $scope.noMoreItemsAvailable = false;
    


	$scope.markStarred = function(loc_id){
		$scope.favresult = [];

      	if(!isEmpty($localstorage.getObject(KEYS.STARREDKEY)))
      		$scope.favresult = $localstorage.getObject(KEYS.STARREDKEY);

      	var doctorinfo = $filter('filter')($scope.searchresult, function (d) {return d.results.loc_id == loc_id;})[0];
		var saveddoctorinfo = $filter('filter')($scope.favresult, function (d) {return d.results.loc_id == loc_id;})[0];

		if(isEmpty(saveddoctorinfo))
		{
	      	$scope.favresult.push(doctorinfo);

			$localstorage.setObject(KEYS.STARREDKEY, $scope.favresult);
			$scope.showalertPopup("Doctor added to Favorites" , "<strong>Dr. "+ doctorinfo.results.first_name + " " + doctorinfo.results.last_name +"</strong> has been added to Favorites");
		}
		else
		{
				$scope.showalertPopup("Doctor added to Favorites" , "<strong>Dr. "+ saveddoctorinfo.results.first_name + " " + saveddoctorinfo.results.last_name +"</strong> has already been added to Favorites");
		}
      	
     };




      
      $scope.loadMore = function() {
        if(!angular.isArray($scope.searchresult) || $scope.searchresult.length == 0 || $scope.items.length == $scope.searchresult.length)
            return;

        var item = $scope.searchresult[$scope.currentIndex];

        $scope.items.push(item);
        $scope.currentIndex++;
       
        if ( $scope.items.length == $scope.searchresult.length ) {
          $scope.noMoreItemsAvailable = true;
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      };
      
      $scope.items = [];

      $scope.$on('$stateChangeSuccess', function() {

        $scope.searchresult = calculateDistance($rootScope.currentPosition,$scope.searchresult, $filter );
        $localstorage.setObject(KEYS.SEARCHRESULTKEY, $scope.searchresult);

        for(var i=0; i<3;i++)
            $scope.loadMore()
        
      });

})

.controller('ActivityMapCtrl', function($scope, $rootScope, $stateParams, $timeout,$ionicNavBarDelegate, $filter, ionicMaterialMotion, ionicMaterialInk,$localstorage,KEYS) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');
    $ionicNavBarDelegate.showBackButton(true);

    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
            selector: '.animate-fade-slide-in .item'
        });
    }, 200);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();

// Map Settings //
    $scope.initialise = function(position) {


        $scope.user = $localstorage.getObject(KEYS.PROFILEKEY);
        $scope.search = $localstorage.getObject(KEYS.SEARCHKEY);
        $scope.searchresult = $localstorage.getObject(KEYS.SEARCHRESULTKEY);  

        var cities = [];

        if($scope.searchresult.length > 0)
        {
            cities =  $scope.searchresult;
            console.log(cities);
        }

        var myLatlng = new google.maps.LatLng(22.5667, 88.3667);

        if(cities.length > 0)
        {
            myLatlng = new google.maps.LatLng(cities[0].results.latitude, cities[0].results.longitude);
        }

               
        var mapOptions = {
            center: myLatlng,
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
      

        $scope.map = map;

         // Create Markers //
            $scope.markers = [];
            var infoWindow = new google.maps.InfoWindow();
            

            var createMarker = function (info){
                var title = 'Dr. ' + info.results.first_name + ' ' + info.results.last_name;
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(info.results.latitude, info.results.longitude),
                    map: $scope.map,
                    animation: google.maps.Animation.DROP,
                    title:title ,
                    icon: {url:    "img/icons/green-marker.png" }
                });


                marker.content = '<div class="infoWindowContent">' 
                + '<span class="avatar dropshadow" style="top:0px;left:0px;background-image: url(\''+info.results.url+'\'),linear-gradient(#28a54c, #d13531);z-index:1;"></span>'
                + '<h4 class="balanced text-right topborder">' + title + '</h4><br/>' 
                + info.results.address + ","
                + info.results.city + "<br/>Distance: "
                + info.distance + "<br/>Visiting Hours: "
                + info.results.hours + "<br/>Fees: "
                + info.results.fees + "<br/>"

                + '<a href="#/app/bookappointment/'+ info.results.loc_id +'"><button class="button button-large button-clear  button-calm waves-effect waves-button waves-light icon ion-android-calendar pull-right"></button></a>'
                + '<button class="button button-large button-clear  button-assertive waves-effect waves-button waves-light icon ion-ribbon-b pull-right"></button>'
                + '<a href="#/app/doctorinfo/'+ info.results.loc_id +'"><button class="button button-large button-clear  button-energized waves-effect waves-button waves-light icon ion-ios-list-outline pull-right"></button></a>'
                + '</div>';


                google.maps.event.addListener(marker, 'click', function(){
                    infoWindow.setContent(marker.content);
                    infoWindow.open($scope.map, marker);
                });
                $scope.markers.push(marker);


            }  

            cities = calculateDistance(position, cities, $filter);

            var bounds = new google.maps.LatLngBounds();
                         
            for (var i = 0; i < cities.length; i++){
               createMarker(cities[i]);
               bounds.extend(new google.maps.LatLng(cities[i].results.latitude, cities[i].results.longitude));
            }

            map.fitBounds(bounds);

    };
    
         
       
           google.maps.event.addDomListener(document.getElementById("map"), 'load', $scope.initialise($rootScope.currentPosition));  

           $scope.$on('$stateChangeSuccess', function() {
                $scope.initialise($rootScope.currentPosition);
           });

           
        
      

})

.controller('SearchCtrl', function($scope,$state, $stateParams, $timeout,$ionicNavBarDelegate, $localstorage, $filter, ionicMaterialMotion, ionicMaterialInk, KEYS, TypeaheadFactory, DoctorFactory) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $ionicNavBarDelegate.showBackButton(true);
    // Set Ink
    ionicMaterialInk.displayEffect();

    $scope.search = {};

    $scope.user = $localstorage.getObject(KEYS.PROFILEKEY);
    $scope.search = $localstorage.getObject(KEYS.SEARCHKEY);
    $scope.search.dr_city = $filter('titleCase')($scope.user.city);
    $scope.searchresult = []; 
   
    loadCity();
    getArea($filter('titleCase')($scope.user.city));
    getSpeiciality();



    function loadCity() {
     
      $scope.cities = $localstorage.getObject(KEYS.CITYKEY);

      var tquery = ({city:'', listname:'city'});

        $scope.cities.length ? null : TypeaheadFactory.query(tquery).then(function (response) {   
            if (response.length > 0)
              $scope.cities = response;
              $localstorage.getObject(KEYS.CITYKEY, $scope.cities);
            });
    }
    

    $scope.updateCity = function()
    {
        getArea($scope.search.dr_city);
    }

   
    $scope.searchByName = function (form) {

            if(form.$valid) {

                  if($scope.show("Please wait: Searching for Doctors...") == false)
                    return;

                        var tquery = ({city:$scope.search.dr_city, fullname:$scope.search.dr_name, searchby:'name'});

                        //Clear Search Result
                        $localstorage.setObject(KEYS.SEARCHRESULTKEY, {});

                                DoctorFactory.query(tquery).then(function (response) { 
                                    if (response.length > 0)  
                                    {
                                            $scope.searchresult = response;
                                            
                                            $scope.search = {}; 
                                            $scope.search.dr_area = tquery.area;
                                            $scope.search.dr_spec = tquery.speciality;
                                            $scope.search.dr_city = tquery.city;
                                            $scope.search.searchby = tquery.searchby;

                                            /*for(var i=0;i<5;i++)
                                                $scope.searchresult = $scope.searchresult.concat($scope.searchresult);
                                                */

                                            $localstorage.setObject(KEYS.SEARCHRESULTKEY, $scope.searchresult);
                                            $localstorage.setObject(KEYS.SEARCHKEY, $scope.search);

                                    }

                                    $scope.hide(); 
                                    $state.go('app.activity');
                            });
                     
            }
        }


    $scope.searchBySpec = function (form) {

            if(form.$valid) {
                  if($scope.show("Please wait: Searching for Doctors...") == false)
                    return;

                var area = $scope.search.dr_area;
                var speciality = $scope.search.dr_spec;

                            if(isEmpty(area))
                                area = '';
                            if(isEmpty(speciality))
                                speciality = '';

                            if(typeof $scope.search.dr_area === 'object')
                                var area = $scope.search.dr_area.area;

                            if(typeof $scope.search.dr_spec === 'object')
                                var speciality = $scope.search.dr_spec.speciality;

                        var tquery = ({city:$scope.search.dr_city, area:area, speciality:speciality, searchby:'speciality'});
                        console.log(tquery);

                        //Clear Search Result
                        $localstorage.setObject(KEYS.SEARCHRESULTKEY, {});

                                DoctorFactory.query(tquery).then(function (response) { 
                                    if (response.length > 0)  
                                    {
                                            $scope.searchresult = response;
                                            
                                            $scope.search = {}; 
                                            $scope.search.dr_area = tquery.area;
                                            $scope.search.dr_spec = tquery.speciality;
                                            $scope.search.dr_city = tquery.city;
                                            $scope.search.searchby = tquery.searchby;

                                            /*for(var i=0;i<5;i++)
                                                $scope.searchresult = $scope.searchresult.concat($scope.searchresult);
                                                */

                                            $localstorage.setObject(KEYS.SEARCHRESULTKEY, $scope.searchresult);
                                            $localstorage.setObject(KEYS.SEARCHKEY, $scope.search);

                                    }

                                    $scope.hide(); 
                                    $state.go('app.activity');
                            });
            }
        }

    function getArea(city){ 

        var tquery = ({city:city, listname:'area'});

        TypeaheadFactory.query(tquery).then(function (response) { 
            if (response.length > 0)  
              $scope.arealist = response;           
            });
    };

    function getSpeiciality(){  

        var tquery = ({city:'', listname:'speciality'});

        TypeaheadFactory.query(tquery).then(function (response) {   
            if (response.length > 0)
              $scope.specialitylist = response;
            });
    };

})

.controller('DoctorCtrl', function($scope,$state, $stateParams, $timeout,$ionicNavBarDelegate, $ionicLoading, $localstorage, $filter, ionicMaterialMotion, ionicMaterialInk, KEYS) {
    // Activate ink for controller
    $scope.$parent.clearFabs();
    ionicMaterialInk.displayEffect();

    $scope.searchresult = $localstorage.getObject(KEYS.SEARCHRESULTKEY);
    $scope.favresult = $localstorage.getObject(KEYS.STARREDKEY);

    $scope.currentdoctor = $filter('filter')($scope.searchresult, function (d) {return d.results.loc_id == $stateParams.loc_id;})[0];

    if(isEmpty($scope.currentdoctor))
    	$scope.currentdoctor = $filter('filter')($scope.favresult, function (d) {return d.results.loc_id == $stateParams.loc_id;})[0];

    $localstorage.setObject(KEYS.DOCTORKEY, $scope.currentdoctor);


    var cities = [];
    cities.push($scope.currentdoctor);



// Map Settings //
    $scope.initialise = function() {

        var myLatlng = new google.maps.LatLng(22.5667, 88.3667);

        if(cities.length > 0)
        {
            myLatlng = new google.maps.LatLng(cities[0].results.latitude, cities[0].results.longitude);
        }

        var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("maps"), mapOptions);
      
        
            map.setCenter(new google.maps.LatLng($scope.currentdoctor.results.latitude, $scope.currentdoctor.results.longitude));
            /*var myLocation = new google.maps.Marker({
                position: new google.maps.LatLng($scope.currentdoctor.results.latitude, $scope.currentdoctor.results.longitude),
                map: map,
                animation: google.maps.Animation.DROP,
                title: 'Dr.' + $scope.currentdoctor.results.first_name + ' ' + $scope.currentdoctor.results.last_name
            });*/
        

        $scope.maps = map;
        // Additional Markers //
        $scope.markers = [];
        var infoWindow = new google.maps.InfoWindow();

        var createMarker = function (info){
                var title = 'Dr. ' + info.results.first_name + ' ' + info.results.last_name;
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(info.results.latitude, info.results.longitude),
                    map: $scope.maps,
                    animation: google.maps.Animation.DROP,
                    title:title ,
                    icon: {url:    "img/icons/green-marker.png" }
                });

                marker.content = '<div class="infoWindowContent">' 
                + '<span class="avatar dropshadow" style="top:0px;left:0px;background-image: url(\''+info.results.url+'\'),linear-gradient(#28a54c, #d13531);z-index:1;"></span>'
                + '<h4 class="balanced text-right topborder">' + title + '</h4><br/>' 
                + '</div>';


                google.maps.event.addListener(marker, 'click', function(){
                    $state.go('app.singlemap');
                });
                $scope.markers.push(marker);
               
            }  
        
        

        for (var i = 0; i < cities.length; i++){
           createMarker(cities[i]);           
        }
        
    };

    google.maps.event.addDomListener(document.getElementById("maps"), 'load', $scope.initialise());
    

    $scope.$on('$stateChangeSuccess', function() {
        $scope.initialise();
      });


    $scope.markStarred = function(loc_id){
		$scope.favresult = [];
		$scope.searchresult = $localstorage.getObject(KEYS.SEARCHRESULTKEY);

		if(!isEmpty($localstorage.getObject(KEYS.STARREDKEY)))
	      		$scope.favresult = $localstorage.getObject(KEYS.STARREDKEY);

		var saveddoctorinfo = $filter('filter')($scope.favresult, function (d) {return d.results.loc_id == loc_id;})[0];

		if(isEmpty(saveddoctorinfo) && !isEmpty($scope.searchresult))
		{
	      	
	      	var doctorinfo = $filter('filter')($scope.searchresult, function (d) {return d.results.loc_id == loc_id;})[0];
	      	if(!isEmpty(doctorinfo))
	      	{
			      	$scope.favresult.push(doctorinfo);

				$localstorage.setObject(KEYS.STARREDKEY, $scope.favresult);
				$scope.showalertPopup("Doctor added to Favorites" , "<strong>Dr. "+ doctorinfo.results.first_name + " " + doctorinfo.results.last_name +"</strong> has been added to Favorites");
			}

		}
		else
		{
				$scope.showalertPopup("Doctor added to Favorites" , "<strong>Dr. "+ saveddoctorinfo.results.first_name + " " + saveddoctorinfo.results.last_name +"</strong> has already been added to Favorites");
		}
      	
     };
    
})


.controller('DoctorMapCtrl', function($scope,$state, $stateParams, $timeout,$ionicNavBarDelegate, $ionicLoading, $localstorage, $filter, ionicMaterialMotion, ionicMaterialInk, KEYS) {
    // Activate ink for controller
    $scope.$parent.clearFabs();
    ionicMaterialInk.displayEffect();

   	$scope.currentdoctor = $localstorage.getObject(KEYS.DOCTORKEY);


    var cities = [];
    cities.push($scope.currentdoctor);


            


   // Map Settings //
    $scope.initialisesingle = function() {

        var myLatlng = new google.maps.LatLng(22.5667, 88.3667);

        if(cities.length > 0)
        {
            myLatlng = new google.maps.LatLng(cities[0].results.latitude, cities[0].results.longitude);
        }

        var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("mapsingle"), mapOptions);
      
        
            map.setCenter(new google.maps.LatLng($scope.currentdoctor.results.latitude, $scope.currentdoctor.results.longitude));

        $scope.mapsingle = map;
        // Additional Markers //
        $scope.markers = [];
        var infoWindow = new google.maps.InfoWindow();

        var createMarker = function (info){
                var title = 'Dr. ' + info.results.first_name + ' ' + info.results.last_name;
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(info.results.latitude, info.results.longitude),
                    map: $scope.mapsingle,
                    animation: google.maps.Animation.DROP,
                    title:title ,
                    icon: {url:    "img/icons/green-marker.png" }
                });

                marker.content = '<div class="infoWindowContent">' 
                + '<span class="avatar dropshadow" style="top:0px;left:0px;background-image: url(\''+info.results.url+'\'),linear-gradient(#28a54c, #d13531);z-index:1;"></span>'
                + '<h4 class="balanced text-right topborder">' + title + '</h4><br/>' 
                + info.results.address + ","
                + info.results.city + "<br/>Visiting Hours: "
                + info.results.hours + "<br/>Fees: "
                + info.results.fees + "<br/>"
                + '<a href="#/app/bookappointment/'+ info.results.loc_id +'"><button class="button button-large button-clear  button-calm waves-effect waves-button waves-light icon ion-android-calendar pull-right"></button></a>'
                + '<button class="button button-large button-clear  button-assertive waves-effect waves-button waves-light icon ion-ribbon-b pull-right"></button>'
                + '<a href="#/app/doctorinfo/'+ info.results.loc_id +'"><button class="button button-large button-clear  button-energized waves-effect waves-button waves-light icon ion-ios-list-outline pull-right"></button></a>'
                + '</div>';


                google.maps.event.addListener(marker, 'click', function(){
                    infoWindow.setContent(marker.content);
                    infoWindow.open($scope.mapsingle, marker);
                });
                $scope.markers.push(marker);
            }  
        
        for (var i = 0; i < cities.length; i++){
           createMarker(cities[i]);
        }

    };


    google.maps.event.addDomListener(document.getElementById("mapsingle"), 'load', $scope.initialisesingle());

    $scope.$on('$stateChangeSuccess', function() {
        $scope.initialisesingle();
      });
    
})


app.controller('FavoriteCtrl', function($scope, $stateParams, $timeout,$ionicNavBarDelegate,$filter,$ionicPopup, ionicMaterialMotion, ionicMaterialInk,$localstorage,KEYS) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');
    $ionicNavBarDelegate.showBackButton(true);

    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
            selector: '.animate-fade-slide-in .item'
        });
    }, 200);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();

    $scope.favresult = $localstorage.getObject(KEYS.STARREDKEY);
    if(isEmpty($scope.favresult))
        $scope.favresult = [];
    

	$scope.markUnstarred = function(loc_id){

		var saveddoctorinfo = $filter('filter')($scope.favresult, function (d) {return d.results.loc_id == loc_id;})[0];

		$ionicPopup.confirm({
                  title: 'Remove from Favorites',
                  content: 'Are you sure you want to remove <strong>Dr. '+ saveddoctorinfo.results.first_name + ' ' + saveddoctorinfo.results.last_name +'</strong> from Favorites?'
                })
                .then(function(result) {
                  if(result) {

                    	if(!isEmpty(saveddoctorinfo))
	      				$scope.favresult.splice(saveddoctorinfo,1);

						$localstorage.setObject(KEYS.STARREDKEY, $scope.favresult);
						$scope.showalertPopup("Doctor removed from Favorites" , "<strong>Dr. "+ saveddoctorinfo.results.first_name + " " + saveddoctorinfo.results.last_name +"</strong> has been removed from Favorites");
                  }
                });

		
      	
     };

})

app.controller('AppointmentScheduleCtrl', function($scope, $stateParams, $timeout,$ionicNavBarDelegate,$filter,$ionicPopup, ionicMaterialMotion, ionicMaterialInk,$localstorage,KEYS, AppointmentFactory) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');
    $ionicNavBarDelegate.showBackButton(true);

    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
            selector: '.animate-fade-slide-in .item'
        });
    }, 200);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();

    $scope.searchresult = $localstorage.getObject(KEYS.SEARCHRESULTKEY);
    $scope.favresult = $localstorage.getObject(KEYS.STARREDKEY);

    $scope.currentdoctor = $filter('filter')($scope.searchresult, function (d) {return d.results.loc_id == $stateParams.loc_id;})[0];

    if(isEmpty($scope.currentdoctor))
        $scope.currentdoctor = $filter('filter')($scope.favresult, function (d) {return d.results.loc_id == $stateParams.loc_id;})[0];

    $localstorage.setObject(KEYS.DOCTORKEY, $scope.currentdoctor);

  var COLORS = ['#4CAF50', '#ddff99' ,'#e6ffe6', '#99ffcc'];
  /*$scope.colorTiles = (function() {
    var tiles = [];
    for (var i = 0; i < 30; i++) {
      tiles.push({
        color: randomColor(),
        colspan: randomSpan(),
        rowspan: randomSpan()
      });
    }
    return tiles;
  })();*/
  function randomColor(i) { 
    return COLORS[Math.floor(i%2*1)];
  }

  function randomSpan(i) {
    var r = Math.random();
    if (r < 0.8) {
      return 1;
    } else if (r < 0.9) {
      return 2;
    } else {
      return 3;
    }

  }

  (function initController() {

            $scope.currentdoctor = $localstorage.getObject(KEYS.DOCTORKEY);
            $scope.appointmentschedule = $localstorage.getObject(KEYS.SCHEDULEKEY);           
            
            if($scope.show("Loading Appointment Schedule") == false)
                    return;

            loadAppointment($scope.currentdoctor.results.loc_id);
            
            

                
            
    })();

  

  function loadAppointment(loc_id)
  {
        var tiles = [];
        var tquery = ({locationid:loc_id});

        AppointmentFactory.getSchedule.query(tquery).$promise.then(function (response) {

            $scope.hide();

            if (response.success)  
            {
                      $scope.colorTiles = response.result;
                      var tiles = [];

                        for (var i = 0; i < $scope.colorTiles.length; i++) {

                                    var daytime = $scope.colorTiles[i].schedule.daytime.split(" ");
                                    var day = daytime[0];
                                    var time = daytime[1];

                                    tiles.push({day: day,
                                        time: time,
                                    color: randomColor(i),
                                    colspan: randomSpan(i),
                                    rowspan: randomSpan(i)
                                    });
                        }
                        
                        $localstorage.setObject(KEYS.SCHEDULEKEY, tiles);
                        $scope.appointmentschedule = $localstorage.getObject(KEYS.SCHEDULEKEY);

                         var now = moment();
                        $scope.currentDate = now.format('DD-MM-YYYY');
                        var prevDate = moment().add(-1, 'days').format('DD-MM-YYYY'); 
                        var nextDate = moment().add(1, 'days').format('DD-MM-YYYY'); 

                        $scope.nextDate = nextDate;
                        $scope.prevDate = prevDate;

                        var day = $filter('titleCase')(now.format('ddd'));
                        loadAppointmentByDay(day);

                }

        });
    }

    function loadAppointmentByDay(day){

        var daySchedule = $filter('filter')($scope.appointmentschedule, function (d) {return d.day == day;}); 
        $scope.currentschedule = daySchedule; 

        $scope.currentday = $filter('titleCase')(moment($scope.currentDate, 'DD-MM-YYYY').format('dddd'));
        

    }


    $scope.LoadNextDateAppts =  function(){

                var curdate = moment($scope.currentDate,'DD-MM-YYYY').add(1,'d');



                $scope.currentDate = curdate.format('DD-MM-YYYY'); 

                var prevDate = curdate.subtract(1, 'd').format('DD-MM-YYYY'); 
                var nextDate = curdate.add(2, 'd').format('DD-MM-YYYY'); 

                $scope.nextDate = nextDate;
                $scope.prevDate = prevDate;



                var day = $filter('titleCase')(moment($scope.currentDate, 'DD-MM-YYYY').format('ddd'));
                        loadAppointmentByDay(day);

    }

    $scope.LoadPreviousDateAppts =  function(){

       
                var curdate = moment($scope.currentDate, 'DD-MM-YYYY').subtract(1,'d');

                if(curdate < moment().subtract(1,'d'))
                {
                        $scope.showalertPopup("Booking Not Allowed" , "Booking for past dates are not allowed.");
                        return;
                }
                    

                $scope.currentDate = curdate.format('DD-MM-YYYY'); 
                var prevDate = curdate.subtract(1, 'd').format('DD-MM-YYYY'); 
                var nextDate = curdate.add(2, 'd').format('DD-MM-YYYY'); 

                $scope.nextDate = nextDate;
                $scope.prevDate = prevDate;

                var day = $filter('titleCase')(moment($scope.currentDate, 'DD-MM-YYYY').format('ddd'));
                        loadAppointmentByDay(day);

    }



    $scope.markStarred = function(loc_id){
        $scope.favresult = [];
        $scope.searchresult = $localstorage.getObject(KEYS.SEARCHRESULTKEY);

        if(!isEmpty($localstorage.getObject(KEYS.STARREDKEY)))
                $scope.favresult = $localstorage.getObject(KEYS.STARREDKEY);

        var saveddoctorinfo = $filter('filter')($scope.favresult, function (d) {return d.results.loc_id == loc_id;})[0];

        if(isEmpty(saveddoctorinfo) && !isEmpty($scope.searchresult))
        {
            
            var doctorinfo = $filter('filter')($scope.searchresult, function (d) {return d.results.loc_id == loc_id;})[0];
            if(!isEmpty(doctorinfo))
            {
                    $scope.favresult.push(doctorinfo);

                $localstorage.setObject(KEYS.STARREDKEY, $scope.favresult);
                $scope.showalertPopup("Doctor added to Favorites" , "<strong>Dr. "+ doctorinfo.results.first_name + " " + doctorinfo.results.last_name +"</strong> has been added to Favorites.");
            }

        }
        else
        {
                $scope.showalertPopup("Doctor added to Favorites" , "<strong>Dr. "+ saveddoctorinfo.results.first_name + " " + saveddoctorinfo.results.last_name +"</strong> has already been added to Favorites.");
        }
        
     };
    

})
