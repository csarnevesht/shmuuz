cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git

bower install ngmap --save                [http://ngmap.github.io/]

bower install angular-bootstrap  --save   [http://angular-ui.github.io/bootstrap/]

bower install geofire --save              [https://github.com/firebase/geofire-js]


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
