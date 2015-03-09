app.controller('GetTogethersCtrl', function($scope, $rootScope, $q, $state, $ionicLoading, $ionicModal, $compile, $timeout, $http, Data, StreetView) {
  console.log('in GetTogethersCtrl controller');

  $rootScope.infowindow = new  google.maps.InfoWindow();
  $scope.search = {};
  $scope.data = {
    showDelete: false,
    showMap: true
  };
  $scope.search.text = "";
  $scope.map;
  $scope.newMarker;
  $scope.getTogethers = $rootScope.getTogethers;
  $scope.markers = $rootScope.markers = [];
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
        console.log('CAROLINA data', data);
        $scope.getTogethers = data[0];
        $scope.userDefaults = data[1].data.user.defaults;
        console.log('CAROLINA userDefaults', $scope.userDefaults);

        $scope.loc = {lat: $scope.userDefaults.center[0], lon: $scope.userDefaults.center[1]};

        console.log('finished loading data', '$scope.getTogethers');
        console.log('in Data.init().then()');
        console.log('GetTogethersCtrl: $scope.getTogethers', $scope.getTogethers);
        console.log('map',map);
        console.log('$scope.getTogethers', $scope.getTogethers);
        console.log('$scope.userDefaults ', $scope.userDefaults);
        console.log('$scope.loc ', $scope.loc);

        // Create our modal
        $ionicModal.fromTemplateUrl('get-together.html', function(modal) {
          console.log('modal ', modal);
          $scope.getTogetherModal = modal;
        }, {
          scope: $scope,
          animation: 'slde-in-up'
        });

        $scope.getTogethers.$loaded().then(function(list) {
          console.log('CAROLINA loaded list',list);
          console.log('*forEach');
          angular.forEach(list, function(g) {
            console.log('g ', g);
            g.position = new google.maps.LatLng(g.latitude,g.longitude);
            var marker = new google.maps.Marker({ position: g.position, map: map, title: g.name, data: g });
            $scope.setMarkerInfoListener(marker, true);
            $scope.markers.push(marker);
          });
          $rootScope.markers = $scope.markers;
          console.log('$scope.markers', $scope.markers);
          $scope.markerClusterer = new MarkerClusterer(map, $scope.markers, {});
          $scope.setNewMarkerListener();
        });
    });

  });

  $scope.getItemHeight = function(item, index) {
     //Make evenly indexed items be 10px taller, for the sake of example
     return (index % 2) === 0 ? 50 : 60;
   };

  // Add infowindow to existing get-togethers markers
  // This function is passed to the app-map directive via the markerinfo argument
  $scope.setMarkerInfoListener = function(marker, apply) {
    console.log('setMarkerInfoListener marker', marker);
    // console.log('$rootScope.map ', $rootScope.map);
    var map = $rootScope.map;

    console.log('google.maps.event', google.maps.event);
    var handle = google.maps.event.addListener(
      marker,
      'click',
      (function(marker, scope){
        return function(event){
          console.log('**** existing marker click **** scope', scope);
          console.log('map', map);

          if($rootScope.infowindow) $rootScope.infowindow.close();
          if(!marker.data) marker.data = {};
          marker.data.prompt = 'Click me to view get-together';
          marker.__content = '<div id="infowindow_content" ng-include src="\'infowindow.html\'"></div>';
          marker.__infowindow = new google.maps.InfoWindow();
          marker.__compiled = $compile(marker.__content)(scope);
          marker.__infowindow.setContent( marker.__compiled[0] );
          scope.getTogether = marker.data;
          console.log('scope.getTogether', scope.getTogether);
          scope.$apply();
          marker.__infowindow.open(map, marker);
          $rootScope.infowindow = marker.__infowindow;
          console.log('click event marker', marker);

        };//return fn()
      })(marker, $scope)
    );//addListener
    console.log('handle', handle);
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
                  console.log('g', event);


                  $rootScope.infowindow.close();
                  $rootScope.infowindow = new google.maps.InfoWindow();
                  $scope.latitude = event.latLng.lat();
                  $scope.longitude = event.latLng.lng();
                  $scope.$apply();
                  g.geocode({
                      "latLng":event.latLng
                  }, function (results, status) {
                        console.log('**** geocode result ****');

                        if (status == google.maps.GeocoderStatus.OK) {
                            var lat = results[0].geometry.location.lat(),
                                lng = results[0].geometry.location.lng(),
                                placeName = results[0].formatted_address,
                                position = new google.maps.LatLng(lat, lng);

                            var getTogether = {
                                  "id": -9,
                                  "name": "",
                                  "address": placeName,
                                  "notes": "",
                                  "img": "",
                                  "latitude": event.latLng.lat(),
                                  "longitude" : event.latLng.lng(),
                                  "position" : position
                                };
                            $scope.getTogether = getTogether;
                            getTogether.prompt = 'Click me to create new get-together';
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
      console.log('clickMe');
      var getTogether = $scope.getTogether;
      console.log('getTogether', getTogether);
      console.log('typeof getTogether.date', typeof getTogether.date);
      console.log('typeof getTogether.time', typeof getTogether.time);

      getTogether.date = new Date(getTogether.__date);
      getTogether.time = new Date(getTogether.__time);
      $scope.getTogetherModal.show();
  };

  $scope.closeMe = function() {
      console.log('closeMe');
      $scope.getTogetherModal.hide();
  };



  $scope.handleGetTogether = function(g) {
      console.log('handleGetTogether', g);
      console.log('$scope', $scope);
      var map = $rootScope.map;
      var image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
      if(g.id == -9) {
         delete g.id;
         delete g.prompt;
         var getTogether = Data.addGetTogether(g);
         console.log('handleGetTogether: getTogether.id', getTogether.id);
         console.log('$scope.newMarker', $scope.newMarker);
         $scope.newMarker.setVisible(false);
         var position = new google.maps.LatLng(getTogether.latitude, getTogether.longitude);
         var mm = new google.maps.Marker({ position: position, map: map, title: getTogether.name, data: getTogether });
         $scope.markers.push(mm);
         mm.setVisible(true);

        //  $scope.markerClusterer.addMarker(mm);

         $scope.setMarkerInfoListener(mm, false);
         $rootScope.infowindow.close();
         console.log('mm', mm);
         google.maps.event.trigger(mm, 'click');

      }
      else {
        $state.go("tabs.get-together-detail", {getTogetherId : g.id});
      }
      $scope.getTogetherModal.hide();

  };

  $scope.gotoCurrentLocation = function () {
      console.log('gotoCurrentLocation, $scope', $scope);
      console.log('gotoCurrentLocation, this', this);

      map = $rootScope.map;

      $rootScope.infowindow.close();
      delete $scope.getTogether;

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
    $scope.getTogetherInfo.hide();
  };
  $scope.showHybridView = function() {
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    map.setTilt(45);
    $scope.getTogetherInfo.hide();
  };





    $scope.mapIt = function(item) {
      // alert('Map Item: ' + item.id);
      $scope.gotoLocation(item.latitude, item.longitude)
    };
    $scope.details = function(item, index) {
      // alert('Details of Item: ' + item.id);
      console.log('details index', index);
      console.log('$scope.getTogethers.indexOf(item)', $scope.getTogethers.indexOf(item));
      item.date = new Date(item.__date);
      item.time = new Date(item.__time);
      $state.go("tabs.get-together-detail", {getTogetherId : index});
    };

    $scope.moveItem = function(item, fromIndex, toIndex) {
      $scope.getTogethers.splice(fromIndex, 1);
      $scope.getTogethers.splice(toIndex, 0, item);
    };

    $scope.deleteItem = function(item) {
      console.log('deleteItem item', item);
      // $scope.getTogethers.splice($scope.getTogethers.indexOf(item), 1);
      Data.deleteGetTogether(item);
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

app.directive('getTogetherInfo', function() {
    console.log('**** getTogetherInfo directive');

    var GetTogetherInfo = function(s, e, a) {
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
      templateUrl: 'get-together-info.html',
      link: function(scope, e, a) {
        console.log('getTogetherInfo directive link function');
        scope.getTogetherInfo= new GetTogetherInfo(scope, e, a);
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


app.controller('GetTogetherDetailCtrl', function($scope, $stateParams, Data, Flickr) {
    $scope.data = {};
    console.log('GetTogetherDetailCtrl');
    console.log('$stateParams', $stateParams);
    $scope.getTogether = Data.getGetTogether($stateParams.getTogetherId);
    console.log('GetTogetherDetailCtrl getTogether', $scope.getTogether);


    var doSearch = ionic.debounce(function(query) {
      Flickr.search(query).then(function(resp) {
        $scope.photos = resp;
        console.log('$scope.photos', $scope.photos);
      });
    }, 500);

    $scope.search = function() {
      console.log('GetTogetherDetailCtrl $scope.data.query', $scope.data.query);
      doSearch($scope.data.query);
    };

    $scope.selectImage = function(photo) {
      console.log('selectImage photo', photo);
      console.log('selectImage getTogether', $scope.getTogether);
      $scope.getTogether.image = photo.media.m;
      // $scope.getTogether.image = photo;
      console.log('selectImage getTogether.image', $scope.getTogether.image);

    }

    $scope.saveMe = function(g) {
      console.log('GetTogetherDetailCtrl::saveMe', g);
      Data.saveGetTogether(g);
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
