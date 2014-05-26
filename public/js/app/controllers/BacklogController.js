'use strict';

cloudScrum.controller('BacklogController', function BacklogController($rootScope, $scope, $http, $location, Flow) {

    $rootScope.selectProject();

    $scope.planning = false;
    $scope.sortable = false;

    $scope.iterations = 0;
    $scope.stories = [];

    $scope.newStoryModal = $('#new-story-modal');
    $scope.newTaskModal = $('#new-task-modal');
    $scope.newReleaseModal = $('#new-release-modal');

    $scope.release = {
        error: '',
        iterationLength: 14,
        startDate: moment().add('days', 1).format('YYYY-MM-DD'),
        minDate: moment().format('YYYY-MM-DD'),
        maxDate: moment().add('years', 2).format('YYYY-MM-DD')
    };

    $http.get('/backlog', { params: { path: Flow.getActiveProjectInfo().path } }).success(function(response) {
        $scope.stories = response;
        $rootScope.loading = false;
    });

    var newStory = function() {
        $scope.story = {
            id: 0,
            title: '',
            estimate: undefined,
            epic: '',
            owner: '',
            status: 0,
            position: 0,
            details: '',
            tasks: []
        };
    };

    var newTask = function() {
        $scope.task = Flow.getNewTask();
    };

    newStory();
    newTask();

    $scope.saveStory = function() {

        if (!$scope.newStoryModal.block()) {
            return;
        }

        $scope.story.position = $scope.stories.length;

        $http.post('/backlog', { story: $scope.story, project: Flow.getActiveProjectInfo() }).success(function(response) {
            $scope.story.id = response.data.id;
            $scope.stories.push(JSON.parse(JSON.stringify($scope.story)));
            $scope.newStoryModal.modal('hide');
            $scope.newStoryModal.unblock();
            newStory();
        });
    };

    $scope.updateStory = function(field, value, id, event) {

        if ($scope.editStoryForm.$valid) {

            var element = $(event.target);

            if (!element.blockElement()) {
                return;
            }

            $http.put('/backlog/' + id, { field: field, value: value, project: Flow.getActiveProjectInfo() }).success(function() {
                element.unblockElement();
            });
        }
    };

    $scope.saveTask = function() {

        if (!$scope.newTaskModal.block()) {
            return;
        }

        $http.post('/backlog/' + $scope.activeStory.id + '/tasks', { task: $scope.task, project: Flow.getActiveProjectInfo() }).success(function() {
            $scope.activeStory.tasks.push(JSON.parse(JSON.stringify($scope.task)));
            $scope.newTaskModal.modal('hide');
            $scope.newTaskModal.unblock();
            newTask();
        });
    };

    $scope.updateTask = function(field, value, id, tid, event) {

        if ($scope.editStoryForm.$valid) {

            var element = $(event.target);

            if (!element.blockElement()) {
                return;
            }

            $http.put('/backlog/' + id + '/tasks/' + tid, { field: field, value: value, project: Flow.getActiveProjectInfo() }).success(function() {
                element.unblockElement();
            });
        }
    };

    $scope.setStory = function(story) {
        $scope.activeStory = story;
    };

    $scope.planRelease = function() {
        $scope.planning = true;
        $scope.stories.unshift({ruler: true, points: 0, iteration: 1});
        $scope.iterations = 1;
    };

    $scope.cancelPlanning = function() {
        bootbox.confirm('Are you sure?', function(result) {
            if (result) {
                $rootScope.error = '';
                $scope.planning = false;
                $scope.iterations = 0;
                for (var i = $scope.stories.length - 1; i >= 0; i--) {
                    if (typeof $scope.stories[i].ruler !== 'undefined') {
                        $scope.stories.splice(i, 1);
                    }
                }
                $rootScope.$apply();
            }
        });
    };

    $scope.addIteration = function() {
        for (var i = $scope.stories.length - 1; i >= 0; i--) {
            if (typeof $scope.stories[i].ruler !== 'undefined') {
                var points = typeof $scope.stories[i + 1] !== 'undefined' && typeof $scope.stories[i + 1].ruler === 'undefined' ? $scope.stories[i + 1].estimate : 0;
                $scope.stories.splice(i + 2, 0, {ruler: true, points: points, iteration: $scope.stories[i].iteration + 1});
                $scope.iterations++;
                break;
            }
        }
    };

    $scope.removeLastIteration = function() {
        for (var i = $scope.stories.length - 1; i >= 0; i--) {
            if (typeof $scope.stories[i].ruler !== 'undefined') {
                $scope.stories.splice(i, 1);
                $scope.iterations--;
                break;
            }
        }
    };

    $scope.saveRelease = function() {

        $rootScope.error = '';

        for (var i = 0, l = $scope.stories.length; i < l; i++) {
            if (typeof $scope.stories[i].ruler !== 'undefined') {
                if ($scope.stories[i].points === 0) {
                    $rootScope.error = 'Some of your iterations are empty!';
                    break;
                }
            }
        }

        if ($rootScope.error === '') {
            $scope.newReleaseModal.modal('show');
        }
    };

    $scope.createRelease = function() {

        if (!$scope.newReleaseModal.block()) {
            return;
        }

        $rootScope.loading = true;
        var iterations = [], stories = [], iteration = 1, totalEstimated = 0, iterationEstimation = 0;

        for (var i = 0; i < $scope.stories.length; i++) {
            if (typeof $scope.stories[i].ruler === 'undefined') {
                stories.push($scope.stories[i].id);
                totalEstimated += $scope.stories[i].estimate;
                iterationEstimation += $scope.stories[i].estimate;
            } else {
                iterations.push({
                    closed: false,
                    stories: stories.slice(0),
                    startDate: moment($scope.release.startDate).add('days', $scope.release.iterationLength * (iteration - 1)).format('YYYY-MM-DD'),
                    endDate: moment($scope.release.startDate).add('days', $scope.release.iterationLength * (iteration++)).format('YYYY-MM-DD'),
                    firstEstimation: iterationEstimation
                });
                stories = [];
                iterationEstimation = 0;
            }
        }

        $scope.release.totalEstimated = totalEstimated;
        $scope.release.endDate = moment($scope.release.startDate).add('days', $scope.release.iterationLength * (iteration - 1)).format('YYYY-MM-DD');

        $scope.release.error = '';

        $http.post('/releases', { release: $scope.release, iterations: iterations, project: Flow.getActiveProjectInfo() }).success(function(response) {

            if (response.status === 'success') {
                $scope.newReleaseModal.modal('hide');
                Flow.setActiveRelease($scope.release.name);
                $location.path('/iteration-tracking');
            } else {
                $scope.release.error = response.message;
            }

            $rootScope.loading = false;
            $scope.newReleaseModal.unblock();
        });
    };

    var orderChanged = false, oldPositions;

    $scope.sortableOptions = {
        start: function() {
            orderChanged = false;
            if (!$scope.planning) {
                oldPositions = {};
                for (var i = 0, l = $scope.stories.length; i < l; i++) {
                    oldPositions[$scope.stories[i].id] = i;
                }
            }
        },
        stop: function() {
            if (orderChanged) {
                var i = 0, l = $scope.stories.length;
                if (!$scope.planning) {
                    var positions = {};
                    for (i = 0; i < l; i++) {
                        if (oldPositions[$scope.stories[i].id] !== i) {
                            positions[$scope.stories[i].id] = i;
                        }
                    }
                    $http.put('/backlog/order', { positions: positions, project: Flow.getActiveProjectInfo() }).success(function() {});
                } else {
                    var sp = 0, it = 1;
                    for (i = 0; i < l; i++) {
                        if (typeof $scope.stories[i].ruler === 'undefined') {
                            sp += $scope.stories[i].estimate;
                        } else {
                            $scope.stories[i].points = sp;
                            $scope.stories[i].iteration = it++;
                            sp = 0;
                        }
                    }
                }
            }
        },
        update: function() {
            orderChanged = true;
        },
        axis: 'y',
        cancel: '.disabled'
    };
});
