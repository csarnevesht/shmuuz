app.controller('LoginCtrl', function($scope, auth, $state, $location, store) {
  console.log('LoginCtrl');
  auth.signin({
    closable: false,
    // This asks for the refresh token
    // So that the user never has to log in again
    authParams: {
      scope: 'openid offline_access'
    }
  }, function(profile, idToken, accessToken, state, refreshToken) {
    store.set('profile', profile);
    store.set('token', idToken);
    store.set('refreshToken', refreshToken);
    auth.getToken({
      api: 'firebase'
    }).then(function(delegation) {
      store.set('firebaseToken', delegation.id_token);


      // CAROLINA HERE: add user to user table.
      // If user not in user table, then create user, otherwise update data

      $state.go('tabs.account');
    }, function(error) {
      console.log("There was an error logging in", error);
    })
  }, function(error) {
    console.log("There was an error logging in", error);
  });

  $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    console.log('$state.go tabs.dash');
    $state.go('tabs.dash');
    // $state.go('login');
  }
})
