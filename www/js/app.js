var app = angular.module('starter.controllers', ['ngMap', 'ui.bootstrap', 'ngResource','auth0','angular-storage','angular-jwt']);

var servicesModule = angular.module('starter.services', ["firebase"])
.constant('FIREBASE_URL', 'https://blazing-torch-7077.firebaseio.com/');

// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function(auth, $ionicPlatform) {
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

.config(function($stateProvider, $urlRouterProvider, authProvider, $httpProvider, jwtInterceptorProvider) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',
  })
  .state('tabs', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html",
    // The tab requires user login
    data: {
      requiresLogin: true
    }
  })
    .state('tabs.about', {
      url: "/about",
      views: {
        'about-tab': {
          templateUrl: "templates/tab-about.html"
        }
      },

    })
    .state('tabs.dash', {
      url: "/dash",
      views: {
        'dash-tab': {
          templateUrl: "templates/tab-dash.html"
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
      .state('tabs.account', {
        url: "/account",
        views: {
          'account-tab': {
            templateUrl: "templates/tab-account.html"
          }
        }
      });

      authProvider.init({
       domain: 'joeshmuuz.auth0.com',
       clientID: 'ZaINHe6gCLQ8oqzbUYCKqt9WDJfS68df',
       loginState: 'login'
     });


     $urlRouterProvider.otherwise("/tab/about");

     // if none of the above states are matched, use this as the fallback
     $urlRouterProvider.otherwise('/tab/dash');

     jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
       var idToken = store.get('token');
       var refreshToken = store.get('refreshToken');
       if (!idToken || !refreshToken) {
         return null;
       }
       if (jwtHelper.isTokenExpired(idToken)) {
         return auth.refreshIdToken(refreshToken).then(function(idToken) {
           store.set('token', idToken);
           return idToken;
         });
       } else {
         return idToken;
       }
     }

     $httpProvider.interceptors.push('jwtInterceptor');

})
