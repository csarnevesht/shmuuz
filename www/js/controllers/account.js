app.controller('AccountCtrl', function($scope, auth, $state, store) {

    console.log('store', store);
    $scope.profile = store.get('profile');



    $scope.logout = function() {
      console.log('AccountCtrl::logout', auth);
      auth.signout();
      store.remove('token');
      store.remove('profile');
      store.remove('refreshToken');
      console.log('$state.go tabs.dash');
      $state.go('tabs.dash');
      // $state.go('login');
    }
});
