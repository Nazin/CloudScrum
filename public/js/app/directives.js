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

function isEmpty(value) {
    return angular.isUndefined(value) || value === '' || value === null || value !== value;
}

cloudScrum.directive('ngMin', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {

            scope.$watch(attr.ngMin, function() {
                ctrl.$setViewValue(ctrl.$viewValue);
            });

            var minValidator = function(value) {
                var min = scope.$eval(attr.ngMin) || 0;
                if (!isEmpty(value) && value < min) {
                    ctrl.$setValidity('ngMin', false);
                    return undefined;
                } else {
                    ctrl.$setValidity('ngMin', true);
                    return value;
                }
            };

            ctrl.$parsers.push(minValidator);
            ctrl.$formatters.push(minValidator);
        }
    };
});

cloudScrum.directive('ngMax', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {

            scope.$watch(attr.ngMax, function() {
                ctrl.$setViewValue(ctrl.$viewValue);
            });

            var maxValidator = function(value) {
                var max = scope.$eval(attr.ngMax) || Infinity;
                if (!isEmpty(value) && value > max) {
                    ctrl.$setValidity('ngMax', false);
                    return undefined;
                } else {
                    ctrl.$setValidity('ngMax', true);
                    return value;
                }
            };

            ctrl.$parsers.push(maxValidator);
            ctrl.$formatters.push(maxValidator);
        }
    };
});
