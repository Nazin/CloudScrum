'use strict';

cloudScrum.controller('IterationStatusController', function IterationStatusController($rootScope, $scope, $http, Flow) {

    $scope.releases = [];
    $scope.release = Flow.getActiveRelease();

    $scope.iterations = [];
    $scope.iteration = (Flow.getActiveIteration() - 1).toString();

    $scope.iterationData = [];
    $scope.storyPointsEstimated = 0;
    $scope.storyPointsAccepted = 0;
    $scope.percentageCompleted = ($scope.storyPointsAccepted / $scope.storyPointsEstimated) * 100;

    $http.get('/releases', { params: { path: Flow.getActiveProjectInfo().path } }).success(function(response) {
        $scope.releases = response;
        getIterations();
    });

    loadIteration();

    $scope.changeRelease = function() {
        Flow.setActiveRelease($scope.release);
        getIterations();
        loadIteration($scope.releases[$scope.release].activeIteration);
        $scope.iteration = ($scope.releases[$scope.release].activeIteration - 1).toString();
    };

    $scope.changeIteration = function() {
        loadIteration(parseInt($scope.iteration) + 1);
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
            //TODO count storyPointsEstimated, storyPointsAccepted, percentageCompleted
        });
    }

    function getIterations() {
        $scope.iterations = [];
        for (var i = 0; i < $scope.releases[$scope.release].iterations; i++) {
            $scope.iterations.push('Iteration ' + (i + 1) + ( i < $scope.releases[$scope.release].activeIteration - 1 ? ' (Closed)' : '' ));
        }
    }
});