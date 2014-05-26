'use strict';

cloudScrum.controller('DashboardController', function DashboardController($rootScope, $scope, Flow, Configuration) {

    $scope.releaseData = true;
    $rootScope.selectProject();

    $scope.loadIterationCallback = function(iteration, release) {
        $scope.iteration = iteration;
        $scope.release = release;
        getActiveIterationStatus();
        getBurndownChartData();
        $rootScope.loading = false;
    };

    $scope.burndownConfig = {
        options: {
            chart: {
                type: 'line',
                zoomType: 'x'
            }
        },
        series: [{
            name: 'Ideal burndown',
            data: [],
            enableMouseTracking: false
        }, {
            name: 'Actual burndown',
            data: [],
            enableMouseTracking: false,
            dataLabels: {
                enabled: true
            }
        }],
        title: {
            text: 'Burndown chart'
        },
        xAxis: {
            title: {
                text: 'Iteration'
            },
            min: 0,
            max: 3,
            minRange: 1,
            allowDecimals: false

        },
        yAxis: {
            title: {
                text: 'Story points'
            },
            min: 0,
            allowDecimals: false
        },
        loading: false
    };

    var getActiveIterationStatus = function() {

        var iterationEstimation = 0;
        $scope.acceptedInActiveIteration = 0;

        if (!$scope.release.closed) {

            for (var i = 0, l = $scope.iteration.stories.length; i < l; i++) {
                iterationEstimation += $scope.iteration.stories[i].estimate;
                if ($scope.iteration.stories[i].status === Configuration.getAcceptedStatusIndex()) {
                    $scope.acceptedInActiveIteration += $scope.iteration.stories[i].estimate;
                }
            }

            if (iterationEstimation !== $scope.iteration.firstEstimation) {
                $scope.release.totalEstimated += iterationEstimation - $scope.iteration.firstEstimation;
            }

            $scope.release.totalAccepted += $scope.acceptedInActiveIteration;
            $scope.$broadcast(Flow.UPDATE_RELEASE_STATUS);
        }
    };

    var getBurndownChartData = function() {

        var ideal = [], actual = [], idealVelocity = $scope.release.totalEstimated / $scope.release.iterations, lastToBurn = $scope.release.totalEstimated;

        ideal.push($scope.release.totalEstimated);
        actual.push($scope.release.totalEstimated);

        $scope.burndownConfig.series[0].data = ideal;
        $scope.burndownConfig.series[1].data = actual;

        for (var i = 0; i < $scope.release.iterations; i++) {
            ideal.push($scope.release.totalEstimated - idealVelocity * (i + 1));
            if (typeof $scope.release.iterationsStatus[i] !== 'undefined') {
                actual.push($scope.release.iterationsStatus[i].toBurn);
                lastToBurn = $scope.release.iterationsStatus[i].toBurn;
            }
        }

        actual.push(lastToBurn - $scope.acceptedInActiveIteration);
    };
});
