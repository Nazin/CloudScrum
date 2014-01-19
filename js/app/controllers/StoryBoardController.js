'use strict';

cloudScrum.controller('StoryBoardController', function StoryBoardController($scope, $rootScope, $location, $timeout, Google, Flow) {

    $scope.statusesInfo = [ //TODO grab from config
        'Not started', 'In progress', 'Completed', 'Testing', 'Accepted', 'Blocked'
    ];

    var statusesInverted = _.invert($scope.statusesInfo);

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
                for (var i=0; i<data[0].stories.length; i++) {
                    var status = $.trim(data[0].stories[i].status);
                    if (typeof status !== 'undefined' && status !== '' && typeof statusesInverted[status] !== 'undefined') {
                        $scope.statuses[statusesInverted[status]].push(data[0].stories[i]);
                    } else {
                        $scope.statuses[0].push(data[0].stories[i]);
                    }
                }
            }, function(error) {
                alert('handle error: ' + error); //todo handle error
            }).finally(function() {
                $rootScope.loading = false;
            });
        }
    });

    $scope.sortableOptions = {
        connectWith: '.stories',
        items: '.story'
    };
});