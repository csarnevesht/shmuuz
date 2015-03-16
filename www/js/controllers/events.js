app.controller('EventsCtrl', function($scope,
                                            $rootScope,
                                            $q,
                                            $state,
                                            auth,
                                            $ionicLoading,
                                            $ionicModal,
                                            $compile,
                                            $timeout,
                                            $http,
                                            Data,
                                            Users,
                                            StreetView) {
  console.log('in EventsCtrl controller');
  $scope.profile = auth.profile;
  console.log('EventsCtrl auth', auth);
  $scope.auth = auth;

  $rootScope.infowindow = new  google.maps.InfoWindow();

  $scope.search = {};
  $scope.data = {
    showDelete: false,
    showMap: true
  };
  $scope.search.text = "";
  $scope.map;
  $scope.newMarker;
  $scope.events = $rootScope.events;
  $scope.markers = [];
  $scope.markerMap = [];
  var homeMarker;

  // $scope.$on('$ionicView.beforeLeave', function(){
  //   alert("Before Leaving");
  // });


  $scope.$on('mapInitialized', function(event, evtMap) {
    console.log('on mapInitialized');
    map = evtMap;
    $scope.map = $rootScope.map = map;

    $q.all([
        Data.init(),
        Data.getUserDefaults()
      ]).then(function(data) {
        Users.getOrCreate(auth.profile);
        console.log('CAROLINA data', data);
        $scope.userDefaults = data[1].data.user.defaults;
        $scope.events = data[0];
        console.log('CAROLINA userDefaults', $scope.userDefaults);

        $scope.loc = {lat: $scope.userDefaults.center[0], lon: $scope.userDefaults.center[1]};

        console.log('finished loading data', '$scope.events');
        console.log('in Data.init().then()');
        console.log('EventsCtrl: $scope.events', $scope.events);
        console.log('map',map);
        console.log('$scope.events', $scope.events);
        console.log('$scope.userDefaults ', $scope.userDefaults);
        console.log('$scope.loc ', $scope.loc);

        // Create our modal
        $ionicModal.fromTemplateUrl('event.html', function(modal) {
          console.log('modal ', modal);
          $scope.eventModal = modal;
        }, {
          scope: $scope,
          animation: 'slde-in-up'
        });

        $scope.events.$loaded().then(function(list) {
          console.log('CAROLINA loaded list',list);
          console.log('*forEach');
          angular.forEach(list, function(e) {

            e.date = new Date(e.date_);
            e.time = new Date(e.time_);

            console.log('e ', e);
            e.position = new google.maps.LatLng(e.latitude,e.longitude);
            var marker = new google.maps.Marker({ position: e.position, map: map, title: e.name, data: e });
            $scope.setMarkerInfoListener(marker, true);
            $scope.markers.push(marker);
            $scope.markerMap[e.$id] = marker;
            console.log('markerMap', $scope.markerMap);
          });
          console.log('$scope.markers', $scope.markers);
          $scope.markerClusterer = new MarkerClusterer(map, $scope.markers, {});
          $scope.setNewMarkerListener();
        });
    });

  });

  $scope.$on('$ionicView.enter', function() {
    $scope.events = Data.allEvents();
    console.log('EventsCtrl view enter, $scope.events', $scope.events);


    if($scope.events && $scope.events.length) {
      console.log('EventsCtrl view enter, $scope.events.length', $scope.events.length);
      console.log('$rootScope.needMarker', $rootScope.needMarker);
      var event = $scope.events[$scope.events.length-1];
      if ($rootScope.needMarker && !$scope.markerMap[event.$id]) {
        $scope.needMarker = false;
        console.log('$scope.newMarker', $scope.newMarker);
        $scope.newMarker.setVisible(false);
        event.date = new Date(event.date_);
        event.time = new Date(event.time_);
        var position = new google.maps.LatLng(event.latitude, event.longitude);
        var mm = new google.maps.Marker({ position: position, map: map, title: event.name, data: event });
        $scope.markers.push(mm);
        $scope.markerMap[event.$id] = mm;
        $scope.setMarkerInfoListener(mm, false);
        console.log('mm', mm);
        google.maps.event.trigger(mm, 'click');
        mm.setVisible(true);
      }
    }

  });

  $scope.$on('$ionicView.leave', function(){
    console.log('EventsCtrl view leave');
  });

  $scope.getItemHeight = function(item, index) {
     //Make evenly indexed items be 10px taller, for the sake of example
     return (index % 2) === 0 ? 50 : 60;
   };

  // Add infowindow to existing events markers
  // This function is passed to the app-map directive via the markerinfo argument
  $scope.setMarkerInfoListener = function(marker, apply) {
    console.log('setMarkerInfoListener marker', marker);
    // console.log('$rootScope.map ', $rootScope.map);
    var map = $rootScope.map;

    // console.log('google.maps.event', google.maps.event);
    var handle = google.maps.event.addListener(
      marker,
      'click',
      (function(marker, scope){
        return function(event){
          console.log('**** existing marker click **** scope', scope);
          // console.log('map', map);
          // console.log('**** existing marker click **** scope.auth.profile', scope.auth.profile);
          // console.log('**** existing marker click **** scope.event.organizer', scope.event.organizer);

          if($rootScope.infowindow) $rootScope.infowindow.close();
          if(!marker.data) marker.data = {};
          marker.data.prompt = 'Click me to view event';
          marker.__content = '<div id="infowindow_content" ng-include src="\'infowindow.html\'"></div>';
          marker.__infowindow = new google.maps.InfoWindow();
          marker.__compiled = $compile(marker.__content)(scope);
          marker.__infowindow.setContent( marker.__compiled[0] );
          scope.event = marker.data;
          // console.log('scope.event', scope.event);
          scope.$apply();
          marker.__infowindow.open(map, marker);
          $rootScope.infowindow = marker.__infowindow;
          // console.log('click event marker', marker);

        };//return fn()
      })(marker, $scope)
    );//addListener
    return handle;
  }//markerInfo

  // Allow a user to add a new marker when the user clicks in the map
  $scope.setNewMarkerListener = function() {
    console.log('setNewMarkerListener');
    // console.log('$rootscope.map', $rootScope.map);

    var map = $rootScope.map,
        geocoder = new google.maps.Geocoder();
    var newMarker = $scope.newMarker = new google.maps.Marker({
            map: map
    });

    // console.log('map', map);

    if($rootScope.infowindow) $rootScope.infowindow.close();
    $rootScope.infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(
         map,
        'click',
        (function(g, m){
              return function (event) {
                  console.log ('map click');
                  console.log('event', event);

                  $rootScope.infowindow.close();
                  $rootScope.infowindow = new google.maps.InfoWindow();
                  $scope.latitude = event.latLng.lat();
                  $scope.longitude = event.latLng.lng();
                  $scope.$apply();
                  g.geocode({
                      "latLng":event.latLng
                  }, function (results, status) {
                        console.log('**** geocode result ****', results);

                        if (status == google.maps.GeocoderStatus.OK) {
                            var lat = results[0].geometry.location.lat(),
                                lng = results[0].geometry.location.lng(),
                                placeName = results[0].formatted_address,
                                position = new google.maps.LatLng(lat, lng);

                            console.log('position', position);

                            var _event = {
                                  "id": -9,
                                  "name": "",
                                  "address": placeName,
                                  "notes": "",
                                  "latitude": event.latLng.lat(),
                                  "longitude" : event.latLng.lng(),
                                  "position" : position
                                };
                            $scope.event = _event;
                            _event.prompt = 'Click me to create new event';
                            $scope.$apply();
                            moveMarker(map, m, $rootScope.infowindow, placeName, position);

                        }
                    });
              };// return fn()
        })(geocoder, newMarker)
     );//addListener
  }//newmarker

  function moveMarker(map, marker, iw, placeName, latlng) {
      console.log('moveMarker $scope', $scope);
      console.log('moveMarker latlng', latlng);
      var image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';
      marker.setIcon(image);
      marker.setVisible(true);
      marker.setPosition(latlng);
      var content = '<div id="infowindow_content" ng-include src="\'infowindow.html\'"></div>';
      var compiled = $compile(content)($scope);
      $scope.$apply();
      iw.close();
      iw.setContent('');
      iw.setContent(compiled[0]);
      iw.open(map, marker);
  }//moveMarker

  $scope.clickMe = function() {
      console.log('clickMe $scope.auth.profile', $scope.auth.profile);
      console.log('clickMe $scope.event.organizer', $scope.event.organizer);
      var event = $scope.event;
      console.log('event', event);


      event.date = new Date(event.date_);
      event.time = new Date(event.time_);

      // $scope.eventModal.show();

      var map = $rootScope.map;
      var image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
      if(event.id == -9) {
         console.log('creating event...');
         delete event.id;
         delete event.prompt;
         event.organizer = {
           id: $scope.auth.profile.user_id,
           name: $scope.auth.profile.name
         };
         $rootScope.infowindow.close();


         console.log('saving event', event);
         var event = $scope.event = Data.addEvent(event).then(function (addedEvent) {
           $scope.event = addedEvent;
           var index = Data.getEventIndex(addedEvent);
           console.log('index ', index);

           $state.go("tabs.event-detail", {eventId : Data.getEventIndex(addedEvent)});
         }, function(error) {
           console.log("Error:", error);
         });
      }
      else {
        var index = Data.getEventIndex(event);
        console.log('index ', index);
        $state.go("tabs.event-detail", {eventId : Data.getEventIndex(event)});
      }
  };


  $scope.closeMe = function() {
      console.log('closeMe');
      $rootScope.infowindow.close();
      $scope.eventModal.hide();
  };



  $scope.handleEvent = function(g) {
      console.log('handleEvent', g);
      console.log('$scope', $scope);
      var map = $rootScope.map;
      var image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
      if(g.id == -9) {
         delete g.id;
         delete g.prompt;
         g.organizer = {
           id: $scope.auth.profile.user_id,
           name: $scope.auth.profile.name
         }
         console.log('saving event', g);
         var event = Data.addEvent(g).then(function (addedEvent) {
           console.log('$scope.newMarker', $scope.newMarker);
           $scope.newMarker.setVisible(false);
           var position = new google.maps.LatLng(event.latitude, event.longitude);
           var mm = new google.maps.Marker({ position: position, map: map, title: event.name, data: event });
           $scope.markers.push(mm);
           $scope.markerMap[event.$id] = mm;
           mm.setVisible(true);

          //  $scope.markerClusterer.addMarker(mm);

           $scope.setMarkerInfoListener(mm, false);
           $rootScope.infowindow.close();
           console.log('mm', mm);
           google.maps.event.trigger(mm, 'click');
         });
      }
      else {
        $state.go("tabs.event-detail", {eventId : Data.getEventIndex(g)});
      }
      $scope.eventModal.hide();

  };

  $scope.gotoCurrentLocation = function () {
      console.log('gotoCurrentLocation, $scope', $scope);
      console.log('gotoCurrentLocation, this', this);

      map = $rootScope.map;

      $rootScope.infowindow.close();
      delete $scope.event;

      $scope.loading = $ionicLoading.show({
        content: 'Getting current location...',
        showBackdrop: false
      });

      if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(function (position) {
              console.log('getCurrentPosition, position ', position.coords.latitude, position.coords.longitude);
              var c = position.coords;
              $scope.gotoLocation(c.latitude, c.longitude);
              $ionicLoading.hide();
              findMeMarker(map, new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 'You are here');
          });
          return true;
      }

      return false;
  };

  function findMeMarker(map, location, msg) {
        console.log('findMeMarker');
        var infowindow = $rootScope.infowindow = new google.maps.InfoWindow();
        var manimg = 'http://maps.gstatic.com/mapfiles/cb/man_arrow-2.png';

        if(!homeMarker) {
          // console.log('homeMarker is null');

          homeMarker = new google.maps.Marker({
             position: location,
             map: map,
             draggable: true
           });
           homeMarker.setIcon(manimg);
        }
        else {
          console.log('homeMarker is not null', homeMarker);
        }
        var content = "<div>" + msg + "</a></div>";
        var compiled = $compile(content)($scope);
        infowindow.setContent( compiled[0] );

        infowindow.open(map,homeMarker);
  }

  $scope.gotoLocation = function (lat, lon) {
      console.log('gotoLocation', $scope);
      console.log('$rootScope.map ', $rootScope.map);
      // console.log('$scope.$$phase ', $scope.$$phase);
      var map = $rootScope.map;
      if ($scope.lat != lat || $scope.lon != lon) {
          $scope.loc = { lat: lat, lon: lon };

          if (!$scope.$$phase) {
            // console.log('gotoLocation , $scope.$apply loc', $scope.loc.lat, $scope.loc.lon);
              $scope.$apply("loc");
          }
          var latlng = new google.maps.LatLng($scope.loc.lat, $scope.loc.lon);
          // console.log('calling $rootScope.map.setCenter latlng', latlng);
          map.setCenter(latlng);
          map.setZoom(17);

      }
  };

  $scope.data.geocode = function() {
    console.log('data.geocode');
    $scope.geoCode();
  }

  // geo-coding
  $scope.geoCode = function () {
      // console.log('geoCode $scope.search.text', $scope.search.text);
      // console.log('$scope.gPlace', $scope.gPlace);
      // console.log('$rootScope.map ', $rootScope.map);
      var map = $rootScope.map;

      if ($scope.search.text && $scope.search.text.length > 0) {
          if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
          this.geocoder.geocode({ 'address': $scope.search.text }, function (results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                  var loc = results[0].geometry.location;
                  $scope.search.text = results[0].formatted_address;
                  console.log('geocoded results', results);
                  $scope.gotoLocation( loc.lat(), loc.lng());
                  map.setZoom(17);
              } else {
                  alert("Sorry, this search produced no results.");
              }
          });
      }
  };

  $scope.showStreetView = function() {
    StreetView.setPanorama(map, $scope.panoId);
    $scope.eventInfo.hide();
  };
  $scope.showHybridView = function() {
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    map.setTilt(45);
    $scope.eventInfo.hide();
  };





    $scope.mapIt = function(item) {
      // alert('Map Item: ' + item.id);
      $scope.gotoLocation(item.latitude, item.longitude)
    };
    $scope.details = function(item, index) {
      // alert('Details of Item: ' + item.id);
      console.log('details index', index);
      console.log('$scope.events.indexOf(item)', $scope.events.indexOf(item));
      item.date = new Date(item.date_);
      item.time = new Date(item.time_);
      $state.go("tabs.event-detail", {eventId : index});
    };

    $scope.moveItem = function(item, fromIndex, toIndex) {
      $scope.events.splice(fromIndex, 1);
      $scope.events.splice(toIndex, 0, item);
    };

    $scope.deleteItem = function(item) {
      console.log('deleteItem item', item);
      // $scope.events.splice($scope.events.indexOf(item), 1);
      console.log('$scope.markerMap', $scope.markerMap);
      var marker = $scope.markerMap[item.$id];
      console.log('marker', marker);
      if (marker) {
        console.log('setting marker to not visible and deleting it');
        marker.setVisible(false);
        $scope.markers.splice($scope.markers.indexOf(marker));
        $scope.markerClusterer = new MarkerClusterer(map, $scope.markers, {});
        delete marker;
        delete $scope.markerMap[event.$id];
        // TODO delete listener handle
      }
      else {
        console.log('marker not found in markerMap');
      }
      Data.deleteEvent(item);
    };
});


app.directive('fullScreenToggle', function() {
    return {
      link: function(scope, e, a) {
        this.click = function() {
          e.parent().toggleClass('full-screen');
          e.text( e.parent().hasClass('full-screen') ? 'Exit Full Screen' : 'Full Screen' );
          google.maps.event.trigger(scope.map, 'resize');
        };
        e.on('click', this.click);
        scope.fullScreenToggle = this;
      }
    }
});

app.directive('eventInfo', function() {
    console.log('**** eventInfo directive');

    var eventInfo = function(s, e, a) {
      this.scope = s;
      this.element = e;
      this.attrs = a;
      this.show = function() {
        this.element.css('display', 'block');
        this.scope.$apply();
      }
      this.hide = function() {
        this.element.css('display', 'none');
      }
    };
    return {
      templateUrl: 'event-info.html',
      link: function(scope, e, a) {
        console.log('eventInfo directive link function');
        scope.eventInfo= new eventInfo(scope, e, a);
      }
    }
});


// formats a number as a latitude (e.g. 40.46... => "40°27'44"N")
app.filter('lat', function () {
    return function (input, decimals) {
        // console.log('lat filter');
        if (!decimals) decimals = 0;
        input = input * 1;
        var ns = input > 0 ? "N" : "S";
        input = Math.abs(input);
        var deg = Math.floor(input);
        var min = Math.floor((input - deg) * 60);
        var sec = ((input - deg - min / 60) * 3600).toFixed(decimals);
        return deg + "°" + min + "'" + sec + '"' + ns;
    }
});

// formats a number as a longitude (e.g. -80.02... => "80°1'24"W")
app.filter('lon', function () {
    return function (input, decimals) {
        // console.log('lon filter');
        if (!decimals) decimals = 0;
        input = input * 1;
        var ew = input > 0 ? "E" : "W";
        input = Math.abs(input);
        var deg = Math.floor(input);
        var min = Math.floor((input - deg) * 60);
        var sec = ((input - deg - min / 60) * 3600).toFixed(decimals);
        return deg + "°" + min + "'" + sec + '"' + ew;
    }
});

app.directive('googleplace', function() {
    return {
        require: 'ngModel',
        scope: {
            geocode: "&"
        },

        controller: ["$scope", "$rootScope", "$compile", "$exceptionHandler", "$element", "$attrs", function ($scope, $rootScope, $compile, $exceptionHandler, $element, $attrs) {
            console.log('[googleplace controller phase]');


        }],
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            console.log('****googleplace directive****');
            console.log('********');
            console.log('********');

            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                scope.$apply(function() {
                    console.log('place_changed in googleplace directive');
                    model.$setViewValue(element.val());
                    scope.geocode();
                });
            });
        }
    };
});


app.controller('EventDetailCtrl', function($scope, $rootScope, $stateParams, Data, Users, Flickr, auth, $ionicHistory) {
    $scope.data = {};
    $scope.auth = auth;
    console.log('EventDetailCtrl');
    console.log('$stateParams', $stateParams);
    $scope.event = Data.getEvent($stateParams.eventId);
    console.log('EventDetailCtrl event', $scope.event);
    $scope.attendees = [];

    if($scope.event.attendees) {
      angular.forEach($scope.event.attendees, function(attendee) {
        console.log('attendee ', attendee);
        var attendeeId = attendee;
        var user = Users.get(attendeeId);
        $scope.attendees.push(user);
      });
      console.log('$scope.attendees ', $scope.attendees);
    };

    var doSearch = ionic.debounce(function(query) {
      Flickr.search(query).then(function(resp) {
        $scope.photos = resp;
        console.log('$scope.photos', $scope.photos);
      });
    }, 500);

    $scope.search = function() {
      console.log('EventDetailCtrl $scope.data.query', $scope.data.query);
      doSearch($scope.data.query);
    };

    $scope.selectImage = function(photo) {
      console.log('selectImage photo', photo);
      console.log('selectImage event', $scope.event);
      $scope.event.image = photo.media.m;
      // $scope.event.image = photo;
      console.log('selectImage event.image', $scope.event.image);

    };

    $scope.saveMe = function(event) {
      console.log('EventDetailCtrl::saveMe', event);
      Data.saveEvent(event);

      event.date = new Date(event.date_);
      event.time = new Date(event.time_);
      console.log('$scope.eventSaved', $scope.eventSaved);
    };

    $scope.registerMe = function(event) {
      console.log('eventDetailCtr::registerMe', event);
      var user = Users.get(auth.profile.user_id);
      console.log('user', user);
      Data.addAttendee(event, auth.profile.user_id);
    };

    $scope.goBack = function() {
      console.log('goBack');
      var event = $scope.event;
      console.log('current event', event);
      console.log('event.organizer', event.organizer);
      if (event.organizer && (event.organizer.id === auth.profile.user_id)) {

         console.log('event.date.toString()', event.date.toString());
         console.log('event.time.toString()', event.date.toString());


         if((event.name === "") ||
           (event.date.toString() === '[Invalid Date]') ||
           (event.date.toString() === 'Invalid Date') ||
           (event.time.toString() === '[Invalid Date]') ||
           (event.time.toString() === 'Invalid Date')) {
           console.log('event not saved or valid, need to delete from db');
           Data.deleteEvent(event);
         }
         else {
           console.log('event saved, keep it in db');
           $rootScope.needMarker = true;
           console.log('setting $rootScope.needMarker', $rootScope.needMarker);

         }
      }
      $ionicHistory.goBack();
    }
})


.factory('Flickr', function($resource, $q) {
  var photosPublic = $resource('http://api.flickr.com/services/feeds/photos_public.gne',
      { format: 'json', jsoncallback: 'JSON_CALLBACK' },
      { 'load': { 'method': 'JSONP' } });

  return {
    search: function(query) {
      var q = $q.defer();
      photosPublic.load({
        tags: query
      }, function(resp) {
        q.resolve(resp);
      }, function(err) {
        q.reject(err);
      })

      return q.promise;
    }
  }
})
