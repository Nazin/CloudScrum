'use strict';

cloudScrum.directive('ngValueChange', function($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        compile: function($element, attr) {

            var fn = $parse(attr['ngValueChange']);

            return function(scope, element, attr) {

                element.on('focus', function() {

                    scope.oldValue = element.val();

                    if (attr['type'] && attr['type'] === 'number') {
                        scope.oldValue = parseInt(scope.oldValue);
                    }
                });

                element.on('blur', function() {

                    var newValue = element.val();
                    if (attr['type'] && attr['type'] === 'number') {
                        newValue = parseInt(newValue);
                    }

                    if (newValue !== scope.oldValue) {
                        scope.$apply(function() {
                            fn(scope, {$event: event, $field: attr['name'], $value: newValue});
                        });
                    }
                })
            };
        }
    };
});


