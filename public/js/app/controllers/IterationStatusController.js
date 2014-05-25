'use strict';

cloudScrum.controller('IterationStatusController', function IterationStatusController($rootScope, $scope, $http, $location, Flow, Configuration) {

    $rootScope.selectProject();

    $scope.releases = [];
    $scope.release = Flow.getActiveRelease();

    $scope.iterations = [];
    $scope.iteration = Flow.getActiveIteration() - 1;

    $scope.iterationData = [];

    $http.get('/releases', { params: { path: Flow.getActiveProjectInfo().path } }).success(function(response) {
        $scope.releases = response;
        if ($scope.releases.length === 0) {
            $location.path('/backlog');
        } else {
            getIterations();
        }
    });

    $scope.$on(Flow.UPDATE_ITERATION_STATUS, function() {
        countStoryPoints();
    });

    $scope.$on(Flow.CLOSE_ITERATION, function(message, release) {
        $scope.releases[$scope.release] = release;
        $scope.changeRelease();
    });

    loadIteration();

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
        for (var i = 0; i < $scope.releases[$scope.release].iterations; i++) {
            $scope.iterations.push('Iteration ' + (i + 1) + ( i < $scope.releases[$scope.release].activeIteration - 1 || release.closed ? ' (Closed)' : '' ));
        }
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

        iteration = iteration || Flow.getActiveIteration();

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
