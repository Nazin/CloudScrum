'use strict';

cloudScrum.controller('IterationTrackingController', function IterationTrackingController($scope, $rootScope, $location, $timeout, Google, Flow) {

    $scope.statusesInfo = [ //TODO grab from config
        'Not started', 'In progress', 'Completed', 'Testing', 'Accepted', 'Blocked'
    ];

    $scope.statuses = [];

    for (var i=0; i<$scope.statusesInfo.length; i++) {
        $scope.statuses.push([]);
    }

    Google.login().then(function() {
        var releaseId = Flow.getReleaseId();
        if (typeof releaseId === 'undefined') {
            $timeout(function() {
                $location.path('/backlog');
            }, 100);//instant redirect is causing some unexpected behaviour with sortable widget
        } else {
            Google.getReleaseStories(releaseId).then(function(data) {
                //TODO take current iteration, allow to change
                console.log(data);
            }, function(error) {
                alert('handle error: ' + error); //todo handle error
            }).finally(function() {
                $rootScope.loading = false;
            });
        }
    });
});