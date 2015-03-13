servicesModule.service('Users', function($state, $q, $http, FIREBASE_URL, $firebase, $rootScope, store) {

  var usersRef = new Firebase(FIREBASE_URL + '/users');
  usersRef.authWithCustomToken(store.get('firebaseToken'), function(error, auth) {
    if (error) {
      // There was an error logging in, redirect the user to login page
      $state.go('login');
    }
  });

  var usersSync = $firebase(usersRef);
  var users = usersSync.$asArray();

  // function initialize() {
  //   console.log('Users::initialize');
  //   var deferred = $q.defer();
  //
  //   usersRef.once('value',
  //       function(snapshot) {
  //           var exists = (snapshot.val() !== null);
  //           console.log('Users::exists', exists);
  //           if(exists) {
  //               console.log('usersSync', usersSync);
  //               users = usersSync.$asArray();
  //               console.log('Data::initialize() users', users);
  //               users.$loaded().then(function(list) {
  //                 console.log('UsersServiceReady');
  //                 $rootScope.$broadcast('UsersServiceReady');
  //                 deferred.resolve(users);
  //               });
  //
  //           }
  //           else {
  //               console.log('Users::initialize empty db, initializing');
  //               usersSync.$push({users: []});
  //               deferred.resolve(users);
  //           }//else
  //   });//usersRef.once()
  //   return deferred.promise;
  //  };

  // this.init = function() {
  //   return initialize();
  // }

  this.all = function() {
    return users;
  };

  this.add = function(user) {
    users.$add(user);
  };

  this.get = function(id) {
    return users.$getRecord(id);
  };

  this.save = function(user) {
    users.$save(user);
  };

  this.delete = function(user) {
    users.$remove(user);
  };

  this.getOrCreate = function(profile) {
    console.log('Users::getOrCreate profile', profile);
    var userData = {
      name : profile.name,
      picture : profile.picture
    };
    usersRef.child(profile.user_id).transaction(function(currentUserData) {
      if(currentUserData === null) {
        return userData;
      }
    }, function(error, committed) {
      if(!committed) {
        console.log('user ' + profile.user_id + ' already exists!');
      }
      else {
        console.log('Successfully created ' + profile.user_id);
      }
    });
  }

});
