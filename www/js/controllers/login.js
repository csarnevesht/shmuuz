app.controller('LoginCtrl', function($scope, auth, $state, $location, store, Users) {
  console.log('LoginCtrl');

  function doAuth() {
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

       Users.getOrCreate(profile);

       $state.go('tabs.account');
     }, function(error) {
       console.log("There was an error logging in", error);
     });
   }

   $scope.$on('$ionic.reconnectScope', function() {
     doAuth();
   });

   doAuth();

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
