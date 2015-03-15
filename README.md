cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git

bower install ngmap --save                [http://ngmap.github.io/]

bower install angular-bootstrap  --save   [http://angular-ui.github.io/bootstrap/]

bower install geofire --save              [https://github.com/firebase/geofire-js]

ionic plugin add org.apache.cordova.inappbrowser  [https://auth0.com/docs/quickstart/hybrid/ionic/firebase]


IMPORTANT:  
    when ionic is installed,  angular 1.3.12 is bundled with it in www/lib/ionic/js/angular.
    when installing ngmap (see above)  the www/lib/ionic/js/angular directory is removed and replaced with
    angular 1.3.6 and placed in www/lib/angular.
    this causes two problems:
    1. the version of angular that ionic depends on is 1.3.12 and not 1.3.6
    2. the newly angular version does not include angular-resource.js, which causes a white screen when ngResource is
       being loaded.

    The www/lib directory has been manually modified to put back angular 1.3.12 in the www/lib/ionic/js/angular directory
    and the www/lib/angular-* directores were removed.

IMPORTANT:
on ios, sometimes the app browser doesn't start, do the following:
ionic platform rm ios
ionic platform add ios
ionic plugin rm org.apache.cordova.inappbrowser
ionic plugin add org.apache.cordova.inappbrowser
ionic plugin rm org.apache.cordova.geolocation
ionic plugin add org.apache.cordova.geolocation


**********************************************************************************************************
I integrated it with firebase by doing the following:

* login to gmail account: joeshmuuz@gmail.com (Joeshmuuz123)
* goto manage.auth0.com and login with gmail account

* create new auth0 app
  went to manage.auth0.com, clicked on Apps/APIs
  [shmuuz@gmail.com, Joeshmuzz123]
  [auth0 domain is shmuuz.auth0.com]
  and created a new app.
  * in here there will be the auth0 app domain, client id, and secret.
  Added localhost:8100 to Allowed Callback URLs
  Added https://joeshmuuz.auth0.com/mobile to Allowed Callback URLs
  Added file://* to Allowed Origins (CORS)
  Added https://joeshmuuz.auth0.com/mobile to Allowed Origins (CORS)

  (see item 3.1 in http://ionicframework.com/blog/authentication-in-ionic/)

* changed auth0-variables.js to:
	var AUTH0_CLIENT_ID='ZaINHe6gCLQ8oqzbUYCKqt9WDJfS68df';
	var AUTH0_CALLBACK_URL=location.href;
	var AUTH0_DOMAIN='joeshmuuz.auth0.com';

* configure autho0 account to work with Firebase
  follow instructions in:
     https://auth0.com/docs/server-apis/firebase

* create facebook and google+ applications to enable authentication
  in auth0:
  follow instructions in:
     also https://auth0.com/docs/facebook-clientid#3
     and  https://auth0.com/docs/goog-clientid
     also:
     http://www.htmlxprs.com/post/8/adding-social-authentication-to-ionic-app-with-firebase-tutorial
     section "Creating Facebook, Google+ and Twitter apps"

      [Add a New App in facebook]
  *** https://developers.facebook.com/apps

	facebook: (
    <script>
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '1672007366360254',
        xfbml      : true,
        version    : 'v2.2'
      });
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  </script>



	client app id 1672007366360254
	secret 39df929d44b9da9d3b13a995c0ab6747

      [Add a New Project in google]
   *** https://console.developers.google.com

	google:
  CLIENT ID 664848155047-67ejklubkj5on3aj5l4k7ae0ha7nq0b9.apps.googleusercontent.com
  EMAIL ADDRESS  664848155047-67ejklubkj5on3aj5l4k7ae0ha7nq0b9@developer.gserviceaccount.com  
  CLIENT SECRET  gCJHCk4Lea52sPsRIPjIBxw-  
  REDIRECT URIS  https://auth.firebase.com/auth/google/callback
 JAVASCRIPT ORIGINS http://localhost:8100

* enable facebook and google+ authentication in auth0
  go to https://manage.auth0.com/#/connections/social
  and enter facebook and google+ info from above

* https://developers.facebook.com/apps/200810843446739/settings/advanced/
  set valid oauth redirect URIs
  to auth0's uri: https://carolina.auth0.com/login/callback


TODO:  
figure out how it works... didn't require any facebook configuration.
There is no firebase here.
***************************************

TODO:
- selectImage causes save button to disappear
- add map refresh button
- separate events from data.js
- simplify event view, remove modal?
- when other user adds or deletes event, update map and ids
