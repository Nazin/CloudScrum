'use strict';

cloudScrum.controller('IterationTrackingController', function IterationTrackingController($rootScope, $scope, $http, $location, Flow, Configuration) {

    $('.modal-backdrop').remove();

    $scope.newTaskModal = $('#new-task-modal');

    Configuration.loadConfiguration().then(function() {
        $scope.storiesStatuses = Configuration.getStoriesStatuses();
        $scope.tasksStatuses = Configuration.getTasksStatuses();
        $scope.users = Configuration.getUsers();
    });

    var newTask = function() {
        $scope.task = Flow.getNewTask();
    };

    newTask();

    $scope.loadIterationCallback = function(iteration, release) {
        $scope.iteration = iteration;
        $scope.release = release;
        $scope.currentIteration = Flow.getActiveIteration();
        for (var i = 0, l = $scope.iteration.stories.length; i < l; i++) {
            $scope.$broadcast(Flow.UPDATE_EFFORT, $scope.iteration.stories[i]);
        }
    };

    $scope.saveTask = function() {

        if (!$scope.newTaskModal.block()) {
            return;
        }

        $http.post('/iteration/' + Flow.getActiveIteration() + '/' + $scope.activeStory.id + '/tasks', { task: $scope.task, project: Flow.getActiveProjectInfo(), name: Flow.getActiveRelease() }).success(function() {
            $scope.activeStory.tasks.push(JSON.parse(JSON.stringify($scope.task)));
            $scope.newTaskModal.modal('hide');
            $scope.newTaskModal.unblock();
            newTask();
        });
    };

    $scope.closeIteration = function() {
        bootbox.confirm('Are you sure you want to close this iteration? All stories which are not accepted will be moved to the next iteration!', function(result) {
            if (result) {
                closeIteration(false, function(response) {
                    $scope.release = response;
                    $scope.currentIteration++;
                    $scope.$broadcast(Flow.CLOSE_ITERATION, response);
                });
            }
        });
    };

    $scope.closeRelease = function() {
        bootbox.confirm('Are you sure you want to close this release? All stories which are not accepted will be moved back to the backlog!', function(result) {
            if (result) {
                closeIteration(true, function() {
                    $location.path('/backlog');
                });
            }
        });
    };

    $scope.toggleTasks = function($event) {
        var tmp = $($event.currentTarget);
        tmp.parents('tbody').toggleClass('active');
    };

    $scope.setStoryCallback = function(story) {
        $scope.activeStory = story;
    };

    var closeIteration = function(closeRelease, callback) {
        var move = [], accepted = [];
        $rootScope.loading = true;
        for (var i = 0, l = $scope.iteration.stories.length; i < l; i++) {
            var story = $scope.iteration.stories[i];
            if (story.status === Configuration.getAcceptedStatusIndex()) {
                accepted.push(story.id);
            } else {
                move.push(story.id);
            }
        }
        $http.put('/iteration/' + $scope.currentIteration, { close: true, closeRelease: closeRelease, move: move, accepted: accepted, project: Flow.getActiveProjectInfo(), name: Flow.getActiveRelease() }).success(callback);
    };
});
