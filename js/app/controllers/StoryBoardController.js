'use strict';

cloudScrum.controller('StoryBoardController', function StoryBoardController($scope, $rootScope, $location, $timeout, Google, Flow, Configuration) {

    $scope.storiesStatusesInfo = Configuration.getStoriesStatuses();
    $scope.statuses = [];
    $scope.iteration = {};
    $scope.users = [];

    var statusesInverted = _.invert($scope.storiesStatusesInfo);

    Google.login().then(function() {
        Flow.on(function() {
            var releaseId = Flow.getReleaseId();
            if (typeof releaseId === 'undefined') {
                $timeout(function() {
                    $location.path('/backlog');
                }, 100);//instant redirect is causing some unexpected behaviour with sortable widget
            } else {
                $scope.$broadcast('PARENT_READY', {
                    releaseId: releaseId
                });
            }
        });
    });

    $scope.sortableOptions = {
        connectWith: '.stories',
        items: '.story'
    };

    $scope.loadIterationCallback = function(iteration, iterations) {
        updateIteration(iteration, iterations);
    };

    $scope.loadReleaseCallback = function(iteration, iterations, users) {
        $scope.users = users;
        updateIteration(iteration, iterations);
    };

    var updateIteration = function(iteration, iterations) {

        $scope.iteration = iteration;
        $scope.iterations = iterations;

        $scope.statuses = [];

        for (var j=0; j<$scope.storiesStatusesInfo.length; j++) {
            $scope.statuses.push([]);
        }

        for (var i=0; i<$scope.iteration.stories.length; i++) {
            var status = $.trim($scope.iteration.stories[i].status);
            if (typeof status !== 'undefined' && status !== '' && typeof statusesInverted[status] !== 'undefined') {
                $scope.statuses[statusesInverted[status]].push($scope.iteration.stories[i]);
            } else {
                $scope.statuses[0].push($scope.iteration.stories[i]);
            }
        }
    };
});