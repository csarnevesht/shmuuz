// This directive is added to the map code to deal with issue https://github.com/driftyco/ionic/issues/1798
app.directive('disableTap', function($timeout) {
    return {
        link: function() {
          $timeout(function() {
            console.log('disableTap directive called');
            container = document.getElementById('pac-container');
            var parent = document.getElementById('autocomplete');

            // disable ionic data tab
            angular.element(container).attr('data-tap-disabled', 'true');
            // document.getElementsByClassName('backdrop')[0].setAttribute('data-tap-disabled', true);
            // leave input field if google-address-entry is selected
            angular.element(container).on("click", function(){
                console.log('on click', event.toElement.parentElement, event, container);
                console.log('***click on pac-container');
                document.getElementById('type-selector').blur();
                document.getElementById('autocomplete').blur();

            });

            // disable ionic data tab
            // angular.element(parent).attr('data-tap-disabled', 'true');
            // leave input field if google-address-entry is selected
            angular.element(parent).on("click", function(){
              console.log('on click', event.toElement.parentElement, event, container);
                console.log('***click on parent');
                // document.getElementById('type-selector').blur();
                document.getElementById('autocomplete').blur();

            });

            angular.element(parent).on('blur', function(){
              console.log('inside BLUR')
            })

          },500);
          // $timeout(function() {
          //   console.log('disableTab directive called');
          //   document.querySelector('.pac-container').setAttribute('data-tap-disabled', 'true')
          // },500);

        }
    };
});

app.directive('clickForOptions', ['$ionicGesture', function($ionicGesture) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $ionicGesture.on('tap', function(e){

                // Grab the content
                var content = element[0].querySelector('.item-content');

                // Grab the buttons and their width
                var buttons = element[0].querySelector('.item-options');

                if (!buttons) {
                    console.log('There are no option buttons');
                    return;
                }
                var buttonsWidth = buttons.offsetWidth;

                ionic.requestAnimationFrame(function() {
                    content.style[ionic.CSS.TRANSITION] = 'all ease-out .25s';

                    if (!buttons.classList.contains('invisible')) {
                        console.log('close');
                        content.style[ionic.CSS.TRANSFORM] = '';
                        setTimeout(function() {
                            buttons.classList.add('invisible');
                        }, 250);
                    } else {
                        buttons.classList.remove('invisible');
                        content.style[ionic.CSS.TRANSFORM] = 'translate3d(-' + buttonsWidth + 'px, 0, 0)';
                    }
                });

            }, element);
        }
    };
}])
