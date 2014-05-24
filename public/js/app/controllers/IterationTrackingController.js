'use strict';

cloudScrum.controller('IterationTrackingController', function IterationTrackingController($scope, $http, Flow, Configuration) {

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

    $scope.loadIterationCallback = function(iteration) {
        $scope.iteration = iteration;
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

    $scope.toggleTasks = function($event) {
        var tmp = $($event.currentTarget);
        tmp.parents('tbody').toggleClass('active');
    };

    $scope.setStory = function(story) {
        $scope.activeStory = story;
    };
});
