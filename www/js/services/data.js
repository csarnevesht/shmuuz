/**
 * A simple example service that returns some data.
 */
servicesModule.factory('Data', function($q, $http, FIREBASE_URL, $firebase, $rootScope, store) {
  console.log('Data service');
  console.log('FIREBASE_URL', FIREBASE_URL);

  var request = $http.get('js/controllers/data.json');

  var __g = [];
  var getTogethers = [];
  var userDefaults = {};

  var ref= new Firebase(FIREBASE_URL + '/getTogethers');
  ref.authWithCustomToken(store.get('firebaseToken'), function(error, auth) {
    if (error) {
      // There was an error logging in, redirect the user to login page
      $state.go('login');
    }
  });

  var sync = $firebase(ref);

  // bind the getTogethers to the firebase provider
  // getTogethers = $firebase(ref);

  ref.on("child_added", function(snapshot) {
    console.log('child_added', snapshot.key());
  });

  ref.on("child_removed", function(snapshot) {
    console.log('child_removed', snapshot.key());
  });

  ref.on("child_changed", function(snapshot) {
    console.log('child_changed', snapshot.key());
  });



  function _add(data) {
      console.log('Data._add', data);

      console.log('data.date', data.date);
      console.log('data.time', data.time);
      console.log('typeof data.date', typeof data.date);
      console.log('typeof data.time', typeof data.time);

      var od = data.date;
      var ot = data.time;

      data.__date = data.date.getTime();
      data.__time = data.time.getTime();
      console.log('data.date', data.date);
      console.log('data.time', data.time);
      console.log('typeof data.date', typeof data.date);
      console.log('typeof data.time', typeof data.time);

      console.log('Data._add saving data.date', data.date);
      console.log('Data._add saving data.time', data.time);
      sync.$push(angular.fromJson(angular.toJson(data))).then(function(newChildRef) {

        var g = getTogethers[getTogethers.length-1];
        g.date = od;
        g.time = ot;

        console.log("added record with id " + newChildRef.key());
        console.log('Data::_add() getTogethers', getTogethers);
      });
  };

  function _update(data) {
    console.log('Data._update getTogethers', getTogethers);
    console.log('Data._update data', data);

    var od = data.date;
    var ot = data.time;
    data.__date = data.date.getTime();
    data.__time = data.time.getTime();
    getTogethers.$save(angular.fromJson(angular.toJson(data)));

    console.log('done updating getTogethers', getTogethers);

  }

  function initialize() {
    console.log('Data::initialize');
    var deferred = $q.defer();

    ref.once('value',
        function(snapshot) {
          console.log('Data::initialize ref.once()');
            var _getTogethers = [];
            var exists = (snapshot.val() !== null);
            console.log('exists', exists);
            if(exists) {
                console.log('sync', sync);
                getTogethers = sync.$asArray();
                console.log('Data::initialize() getTogethers', getTogethers);
                getTogethers.$loaded().then(function(list) {
                  angular.forEach(list, function(g) {
                    g.date = new Date(g.__date);
                    g.time = new Date(g.__time);
                  });
                  console.log('DataServiceReady');
                  $rootScope.$broadcast('DataServiceReady');
                  deferred.resolve(getTogethers);
                });

            }
            else {
                console.log('Data::initialize empty db, initializing');
                request.then(function(response){
                          console.log('Data service: in then function');
                          __g = response.data.getTogethers;
                          console.log("db is empty, initializing db");
                          console.log('ref ' + ref.toString());
                          console.log('sync', sync);
                          sync.$push({getTogethers: []});

                          console.log('read getTogethers from data.json', __g);
                          for (var i = 0; i < __g.length; i++) {
                            var g = __g[i];
                            g.date = new Date(g.__date);
                            g.time = new Date(g.__time);
                            console.log('storing ', g);
                            _add(g);
                            g.id = i;
                          }
                          getTogethers = sync.$asArray();
                          console.log('Data::initialize() getTogethers', getTogethers);
                          getTogethers.$loaded().then(function(list) {
                            angular.forEach(list, function(g) {
                              // g.date = new Date(g.__date);
                              // g.time = new Date(g.__time);
                            });
                            console.log('DataServiceReady');
                            $rootScope.$broadcast('DataServiceReady');
                            deferred.resolve(getTogethers);
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
    addGetTogether: function(getTogether) {
      console.log('Data service: addGetTogether', getTogether);
      getTogether.id = getTogethers.length;
      _add(getTogether);
      // getTogethers.$save(getTogether);
      console.log('Data service: addGetTogether', getTogethers);
      return getTogether;
    },
    saveGetTogether: function(getTogether) {
      console.log('Data::saveGetTogether getTogether', getTogether);
      _update(getTogether);
      console.log('saveGettogether() getTogether', getTogether);
    },
    allGetTogethers: function() {
      console.log('Data service allGetTogethers()', getTogethers);
      // return getTogethers;
      var g = initialize();
      console.log('g', g);
      return g;

    },
    getGetTogether: function(getTogetherId) {
      console.log('Data:getGetTogether( getTogetherId=' + getTogetherId + ')', getTogethers[getTogetherId]);
      // Simple index lookup
      return getTogethers[getTogetherId];
    },
    deleteGetTogether: function(getTogether) {
      console.log('Data::deleteGetTogether getTogether', getTogether);
      var newRef = ref.child(getTogether.$id);
      console.log('newRef', newRef);
      newRef.remove();
    },
    getUserDefaults: function() {
      console.log('Data service getUserDefaults()');
      var deferred = $q.defer();

      deferred.resolve(request);
      return deferred.promise;
    }
  }
});
