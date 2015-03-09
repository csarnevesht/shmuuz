
app.controller('FriendsCtrl', function($scope, Friends) {
  console.log('FriendsCtrl');
  $scope.friends = Friends.all();
})

app.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})
