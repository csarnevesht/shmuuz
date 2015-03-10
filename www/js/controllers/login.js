app.controller('LoginCtrl', function($scope, auth, $state, store) {
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
    $state.go('tabs.dash');
    console.log('profile ', profile);
    // console.log('auth, ', auth);
    // $scope.auth = auth;
    console.log('setting $scope.auth to auth, ', $scope.auth);
  }, function(error) {
    console.log("There was an error logging in", error);
  });
})
