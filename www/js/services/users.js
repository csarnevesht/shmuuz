
servicesModule.factory('Users', function(FIREBASE_URL, $firebase, store, $state) {

  var request = $http.get('js/controllers/users.json');

  var usersRef = new Firebase(FIREBASE_URL + '/users'));
  usersRef.authWithCustomToken(store.get('firebaseToken'), function(error, auth) {
    if (error) {
      // There was an error logging in, redirect the user to login page
      $state.go('login');
    }
  });

  var usersSync = $firebase(usersRef);
  var users = usersSync.$asArray();

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

});
