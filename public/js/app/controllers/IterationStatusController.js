'use strict';

cloudScrum.controller('IterationStatusController', function IterationStatusController($rootScope, $scope, $http, $location, Flow, Configuration, growlNotifications) {

    $scope.releases = [];
    $scope.release = Flow.getActiveRelease();

    $scope.iterations = [];
    $scope.iteration = Flow.getActiveIteration() - 1;

    $scope.iterationData = [];

    $http.get('/releases', { params: { path: Flow.getActiveProjectInfo().path } }).success(function(response) {
        $scope.releases = response;
        if (Object.keys($scope.releases).length === 0) {
            growlNotifications.add('Please create release first', 'warning', 2000);
            $location.path('/backlog');
        } else {
            getIterations();
            loadIteration();
        }
    });

    $scope.$on(Flow.UPDATE_ITERATION_STATUS, function() {
        countStoryPoints();
    });

    $scope.$on(Flow.UPDATE_RELEASE_STATUS, function() {
        countReleaseStatus();
    });

    $scope.$on(Flow.CLOSE_ITERATION, function(message, release) {
        $scope.releases[$scope.release] = release;
        $scope.changeRelease();
    });

    $scope.changeRelease = function() {
        Flow.setActiveRelease($scope.release, $scope.releases[$scope.release].activeIteration);
        getIterations();
        loadIteration($scope.releases[$scope.release].activeIteration);
        $scope.iteration = $scope.releases[$scope.release].activeIteration - 1;
    };

    $scope.changeIteration = function() {
        loadIteration($scope.iteration + 1);
    };

    var getIterations = function() {
        $scope.iterations = [];
        var release = $scope.releases[$scope.release];
        if (typeof release === 'undefined') {
            $scope.release = Object.keys($scope.releases)[0];
            release = $scope.releases[$scope.release];
            Flow.setActiveRelease($scope.release, release.activeIteration);
        }
        if (isNaN($scope.iteration)) {
            $scope.iteration = release.activeIteration - 1;
        }
        for (var i = 0; i < $scope.releases[$scope.release].iterations; i++) {
            $scope.iterations.push('Iteration ' + (i + 1) + ( i < $scope.releases[$scope.release].activeIteration - 1 || release.closed ? ' (Closed)' : '' ));
        }
        countReleaseStatus();
    };

    var countReleaseStatus = function() {
        $scope.releasepercentageCompleted = ($scope.releases[$scope.release].totalAccepted / $scope.releases[$scope.release].totalEstimated) * 100;
    };

    var countStoryPoints = function() {

        $scope.storyPointsEstimated = 0;
        $scope.storyPointsAccepted = 0;

        var stories = $scope.iterationData.stories, acceptedStatus = Configuration.getAcceptedStatusIndex();

        for (var i = 0, l = stories.length; i < l; i++) {

            $scope.storyPointsEstimated += stories[i].estimate;

            if (stories[i].status === acceptedStatus) {
                $scope.storyPointsAccepted += stories[i].estimate;
            }
        }

        $scope.percentageCompleted = ($scope.storyPointsAccepted / $scope.storyPointsEstimated) * 100;
    };

    function loadIteration(iteration) {

        $rootScope.loading = true;

        iteration = iteration || Flow.getActiveIteration() || $scope.releases[$scope.release].activeIteration;

        if (iteration !== Flow.getActiveIteration()) {
            Flow.setActiveIteration(iteration);
        }

        $http.get('/iteration/' + iteration, { params: { path: Flow.getActiveProjectInfo().path, name: $scope.release } }).success(function(response) {
            $scope.iterationData = response;
            $rootScope.loading = false;
            countStoryPoints();
            $scope.loadIterationCallback(response, $scope.releases[$scope.release]);
        });
    }
});
