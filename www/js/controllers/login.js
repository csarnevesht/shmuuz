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
    // $state.go('tabs.account');
    $location.path('/');
    console.log('profile ', profile);
    console.log('setting $scope.auth to auth, ', $scope.auth);
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
