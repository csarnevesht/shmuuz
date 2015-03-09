var app = angular.module('starter.controllers', ['ngMap', 'ui.bootstrap', 'ngResource']);

var servicesModule = angular.module('starter.services', ["firebase"])
.constant('FIREBASE_URL', 'https://blazing-torch-7077.firebaseio.com/');

// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $logProvider) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('tabs', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })
  .state('search', {
      url: '/search',
      templateUrl: 'search.html'
    })
    .state('settings', {
      url: '/settings',
      templateUrl: 'settings.html'
    })

    .state('tabs.home', {
      url: "/home",
      views: {
        'home-tab': {
          templateUrl: "home.html",
          controller: 'HomeTabCtrl'
        }
      }
    })
   .state('tabs.get-togethers', {
       url: '/get-togethers',
       views: {
         'get-togethers-tab': {
           templateUrl: 'templates/tab-get-togethers.html',
           controller: 'GetTogethersCtrl'
         }
       }
     })
     .state('tabs.get-together-detail', {
       url: '/get-together/:getTogetherId',
       views: {
         'get-togethers-tab': {
           templateUrl: 'templates/get-together-detail.html',
           controller: 'GetTogetherDetailCtrl'
         }
       }
     })
    .state('tabs.get-togethers-list', {
      url: "/get-togethers-list",
      views: {
        'home-tab': {
          templateUrl: "templates/get-togethers-list.html",
          controller: 'GetTogethersCtrl'
        }
      }
    })
    // .state('tabs.get-togethers-list', {
    //   url: "/get-togethers-list",
    //   templateUrl: "templates/tab-get-togethers.html",
    // })
    .state('tabs.about', {
      url: "/about",
      views: {
        'about-tab': {
          templateUrl: "about.html"
        }
      }
    })
    .state('tabs.navstack', {
      url: "/navstack",
      views: {
        'about-tab': {
          templateUrl: "nav-stack.html"
        }
      }
    })
    .state('tabs.contact', {
      url: "/contact",
      views: {
        'contact-tab': {
          templateUrl: "contact.html"
        }
      }
    })
    .state('tabs.chats', {
       url: '/chats',
       views: {
         'chats-tab': {
           templateUrl: 'templates/tab-chats.html',
           controller: 'ChatsCtrl'
         }
       }
     })
     .state('tabs.chat-detail', {
       url: '/chats/:chatId',
       views: {
         'chats-tab': {
           templateUrl: 'templates/chat-detail.html',
           controller: 'ChatDetailCtrl'
         }
       }
     })
     .state('tabs.friends', {
       url: '/friends',
       views: {
         'friends-tab': {
           templateUrl: 'templates/tab-friends.html',
           controller: 'FriendsCtrl'
         }
       }
     })
     .state('tabs.friend-detail', {
       url: '/friend/:friendId',
       views: {
         'friends-tab': {
           templateUrl: 'templates/friend-detail.html',
           controller: 'FriendDetailCtrl'
         }
       }
    });

    $urlRouterProvider.otherwise("/tab/get-togethers");
})

.controller('NavCtrl', function($scope, $ionicSideMenuDelegate) {
  $scope.showMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
  };
  $scope.showRightMenu = function () {
    $ionicSideMenuDelegate.toggleRight();
  };
})
.controller('HomeTabCtrl', function($scope) {
});
