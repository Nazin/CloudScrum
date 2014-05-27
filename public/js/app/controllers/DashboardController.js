'use strict';

cloudScrum.controller('DashboardController', function DashboardController($rootScope, $scope, Flow, Configuration) {

    $scope.releaseData = true;
    $rootScope.selectProject();

    $scope.loadIterationCallback = function(iteration, release) {

        $scope.iteration = iteration;
        $scope.release = release;

        Configuration.loadConfiguration().then(function() {

            getUsers();
            getActiveIterationStatus();
            getBurndownChartData();
            getTasksEffortEstimateChartData();

            $rootScope.loading = false;
        });
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

    $scope.tasksEffortEstimateChartConfig = {
        options: {
            chart: {
                type: 'column'
            }
        },
        title: {
            text: 'Tasks: estimations vs. effort'
        },
        xAxis: {
            title: {
                text: 'Iteration'
            },
            min: 1,
            categories: []
        },
        yAxis: {
            title: {
                text: 'Hours'
            },
            min: 0
        },
        series: [{
            name: 'Tasks estimations',
            data: []
        }, {
            name: 'Tasks effort',
            data: []
        }],
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

        for (var i = 0; i < $scope.release.iterations; i++) {
            ideal.push($scope.release.totalEstimated - idealVelocity * (i + 1));
            if (typeof $scope.release.iterationsStatus[i] !== 'undefined') {
                actual.push($scope.release.iterationsStatus[i].toBurn);
                lastToBurn = $scope.release.iterationsStatus[i].toBurn;
            }
        }

        actual.push(lastToBurn - $scope.acceptedInActiveIteration);

        $scope.burndownConfig.series[0].data = ideal;
        $scope.burndownConfig.series[1].data = actual;
        $scope.burndownConfig.xAxis.max = $scope.release.iterations;
    };

    var getTasksEffortEstimateChartData = function() {

        var tasksEstimation = [], tasksEffort = [], i, l;

        for (i = 0, l = $scope.release.iterationsStatus.length; i < l; i++) {
            var iterationStatus = $scope.release.iterationsStatus[i];
            tasksEstimation.push(iterationStatus.totalTasksEstimation);
            tasksEffort.push(iterationStatus.totalTasksEffort);
        }

        tasksEstimation.unshift(0);
        tasksEffort.unshift(0);

        if (!$scope.release.closed) {

            var iterationTasksEstimation = 0, iterationTasksEffort = 0;

            for (i = 0, l = $scope.iteration.stories.length; i < l; i++) {
                for (var j = 0, lj = $scope.iteration.stories[i].tasks.length; j < lj; j++) {
                    var task = $scope.iteration.stories[i].tasks[j];
                    iterationTasksEstimation += task.estimate;
                    iterationTasksEffort += task.effort;
                }
            }

            tasksEstimation.push(iterationTasksEstimation);
            tasksEffort.push(iterationTasksEffort);
        }

        $scope.tasksEffortEstimateChartConfig.series[0].data = tasksEstimation;
        $scope.tasksEffortEstimateChartConfig.series[1].data = tasksEffort;
    };

    var getUsers = function() {
        $scope.usersMapping = {};
        $scope.users = Configuration.getUsers();
        for (var i = 0, l = $scope.users.length; i < l; i++) {
            $scope.usersMapping[$scope.users[i].email] = $scope.users[i].name;
        }
    };
});
