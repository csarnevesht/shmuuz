/**
 * A simple example service that returns some data.
 */
servicesModule.factory('Data', function($state, $q, $http, FIREBASE_URL, $firebase, $rootScope, store) {
  console.log('Data service');
  console.log('FIREBASE_URL', FIREBASE_URL);

  var request = $http.get('js/controllers/data.json');

  var __g = [];
  var events = [];
  var eventMap = [];
  var userDefaults = {};

  var ref= new Firebase(FIREBASE_URL + '/events');
  ref.authWithCustomToken(store.get('firebaseToken'), function(error, auth) {
    if (error) {
      // There was an error logging in, redirect the user to login page
      $state.go('login');
    }
  });

  var sync = $firebase(ref);

  // bind the events to the firebase provider
  // events = $firebase(ref);

  ref.on("child_added", function(snapshot) {
    console.log('child_added', snapshot.key());
    updateMap();
  });

  ref.on("child_removed", function(snapshot) {
    console.log('child_removed', snapshot.key());
    updateMap();
  });

  ref.on("child_changed", function(snapshot) {
    console.log('child_changed', snapshot.key());
  });

  function logMap() {
    console.log('logMap');
    console.log('events', events);
    console.log('eventMap', eventMap);
  };

  function updateMap() {
    console.log('updateMap');
    eventMap = [];
    var i=0;
    angular.forEach(events, function(event) {
      eventMap[event.$id] = i++;
    });
    console.log('events', events);
    console.log('eventMap', eventMap);
  };

  function _add(data) {
      var deferred = $q.defer();
      console.log('_add');
      var od = data.date;
      var ot = data.time;
      data.date_ = data.date.getTime();
      data.time_ = data.time.getTime();
      data.date = data.date.toString();
      data.time = data.time.toString();

      if(isNaN(data.date_)) {
        data.date_ = Date.today().getTime();
      }
      if(isNaN(data.time_)) {
        var t = Date.now().addHours(2).toString("HH:mm");
        data.time_ = Date.parse(t).getTime();
      }

      console.log('_add: adding data', data);
      events.$add(data).then(function() {
        console.log('_add: pushed event, events', events);
        console.log('_add: events length', events.length);
        var event = events[events.length-1];
        console.log('_add: added event, ', event);

        event.date = new Date(event.date_);
        event.time = new Date(event.time_);

        eventMap[event.$id] = events.length-1;
        logMap();
        deferred.resolve(event);
      }, function(error) {
        console.log("Error:", error);
      });
      // sync.$push(data).then(function(newChildRef) {
      //   console.log('newChildRef', newChildRef);
      //   console.log('_add: pushed event, events', events);
      //   console.log('_add: events length', events.length);
      //   var event = events[events.length-1];
      //   console.log('_add: added event, ', event);
      //
      //   event.date = new Date(event.date_);
      //   event.time = new Date(event.time_);
      //
      //   eventMap[event.$id] = events.length-1;
      //   logMap();
      //   deferred.resolve(event);
      // }, function(error) {
      //   console.log("Error:", error);
      // });
      return deferred.promise;
  };

  function _update(data) {
    data.date_ = data.date.getTime();
    data.time_ = data.time.getTime();
    // data.datenum = data.date.getTime();
    // data.timenum = data.time.getTime();
    console.log('typeof data.date_', typeof data.date_);
    console.log('Data::_update() json str', angular.fromJson(angular.toJson(data)));
    // events.$save(angular.fromJson(angular.toJson(data)));
    data.date = data.date.toString();
    data.time = data.time.toString();

    events.$save(data);

    event.date = new Date(event.date_);
    event.time = new Date(event.time_);

  }

  function initialize() {
    console.log('Data::initialize');
    var deferred = $q.defer();

    ref.once('value',
        function(snapshot) {
            var _events = [];
            var exists = (snapshot.val() !== null);
            console.log('exists', exists);
            if(exists) {
                console.log('sync', sync);
                events = sync.$asArray();
                console.log('Data::initialize() events', events);
                events.$loaded().then(function(list) {
                  var i = 0;
                  angular.forEach(list, function(event) {
                    event.date = new Date(event.date_);
                    event.time = new Date(event.time_);
                    eventMap[event.$id] = i++;
                  });
                  logMap();
                  console.log('DataServiceReady');
                  $rootScope.$broadcast('DataServiceReady');
                  deferred.resolve(events);
                });

            }
            else {
                console.log('Data::initialize empty db, initializing');
                sync.$push({events: []});
                events = sync.$asArray();

                request.then(function(response){
                          __event = response.data.events;
                          console.log("db is empty, initializing db");
                          console.log('ref ' + ref.toString());
                          console.log('sync', sync);

                          console.log('read events from data.json', __event);
                          for (var i = 0; i < __event.length; i++) {
                            var event = __event[i];
                            event.date = new Date(event.date_);
                            event.time = new Date(event.time_);
                            console.log('storing ', event);
                            _add(event);
                          }
                          console.log('Data::initialize() events', events);
                          events.$loaded().then(function(list) {
                            updateMap();
                            console.log('DataServiceReady');
                            $rootScope.$broadcast('DataServiceReady');
                            deferred.resolve(events);
                          });
                });//request.then
            }//else
    });//ref.once()

    return deferred.promise;
   };

  return {
    init: function() {
        console.log('Data service init()');
        return initialize();
    },
    addEvent: function(event) {
      console.log('Data service: addEvent', event);
      // eventMap[event.$id] = events.length;
      return _add(event);
    },
    saveEvent: function(event) {
      console.log('Data::saveEvent event', event);
      _update(event);
      console.log('saveEvent() event', event);
    },
    allEvents: function() {
      console.log('Data service allEvents()', events);
      return events;
      // var g = initialize();
      // console.log('g', g);
      // return g;

    },
    getEvent: function(eventId) {
      console.log('Data:getEvent( eventId=' + eventId + ')', events[eventId]);
      // Simple index lookup
      return events[eventId];
    },
    deleteEvent: function(event) {
      console.log('Data::deleteEvent event', event);
      // var newRef = ref.child(event.$id);
      // console.log('newRef', newRef);
      // newRef.remove();
      logMap();
      var index = events.indexOf(event);
      events.$remove(event).then(function() {
        console.log('after remove');
        updateMap();
        logMap();
      });

    },
    getEventIndex: function(event) {
      logMap();
      return eventMap[event.$id];
    },
    addAttendee: function(event, userid) {
      console.log('Data::addAttendee to event', event);
      console.log('userid', userid);
      var eventRef = ref.child(event.$id);
      var attendeesRef = eventRef.child('attendees');
      // attendeesRef.push(userid);

      var userData = userid;
      attendeesRef.child(userid).transaction(function(currentUserData) {
        if(currentUserData === null) {
          return userData;
        }
      }, function(error, committed) {
        if(!committed) {
          console.log('attendee ' + userid + ' already exists!');
        }
        else {
          console.log('Successfully added ' + userid);
        }
      });

    },
    getUserDefaults: function() {
      console.log('Data service getUserDefaults()');
      var deferred = $q.defer();

      deferred.resolve(request);
      return deferred.promise;
    }
  }
});
