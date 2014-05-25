'use strict';

cloudScrum.controller('IterationTrackingController', function IterationTrackingController($rootScope, $scope, $http, Flow, Configuration) {

    $('.modal-backdrop').remove();

    $scope.newTaskModal = $('#new-task-modal');
    $scope.editModal = $('#edit-modal');

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
            $scope.updateEffort($scope.iteration.stories[i]);
        }
    };

    $scope.updateStory = function(field, value, id, event, formId) {

        formId = formId || 'editIterationForm';

        if ($scope[formId].$valid) {

            if (event) {

                var element = $(event.target);

                if (!element.blockElement()) {
                    return;
                }
            }

            $http.put('/iteration/' + Flow.getActiveIteration() + '/' + id, { field: field, value: value, project: Flow.getActiveProjectInfo(), name: Flow.getActiveRelease() }).success(function() {
                if (event) {
                    element.unblockElement();
                }
            });
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

    $scope.updateTask = function(field, value, id, tid, event, formId) {

        formId = formId || 'editIterationForm';

        if ($scope[formId].$valid) {

            var element = $(event.target);

            if (!element.blockElement()) {
                return;
            }

            $http.put('/iteration/' + Flow.getActiveIteration() + '/' + id + '/tasks/' + tid, { field: field, value: value, project: Flow.getActiveProjectInfo(), name: Flow.getActiveRelease() }).success(function() {
                element.unblockElement();
            });
        }
    };

    $scope.updateEffort = function(story) {

        story.effort = 0;

        for (var i = 0, l = story.tasks.length; i < l; i++) {
            story.effort += story.tasks[i].effort;
        }
    };

    $scope.showStoryDetails = function(story) {
        $scope.setStory(story);
        $scope.editItem = story;
        $scope.editItemStory = true;
        $scope.editItemStatuses = $scope.storiesStatuses;
        showEditForm();
    };

    $scope.showTaskDetails = function(task, id) {
        $scope.activeTaskId = id;
        $scope.editItem = task;
        $scope.editItemStory = false;
        $scope.editItemStatuses = $scope.tasksStatuses;
        showEditForm();
    };

    $scope.updateEditElement = function(field, value, event) {
        if ($scope.editItemStory) {
            $scope.updateStory(field, value, $scope.activeStory.id, event, 'editForm');
        } else {
            $scope.updateTask(field, value, $scope.activeStory.id, $scope.activeTaskId, event, 'editForm');
        }
    };

    $scope.closeIteration = function() {
        bootbox.confirm('Are you sure you want to close this iteration? All stories which are not accepted will be moved to the next iteration!', function(result) {
            if (result) {
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
                $http.put('/iteration/' + $scope.currentIteration, { close: true, move: move, accepted: accepted, project: Flow.getActiveProjectInfo(), name: Flow.getActiveRelease() }).success(function(response) {
                    $scope.release = response;
                    $scope.currentIteration++;
                    $scope.$broadcast(Flow.CLOSE_ITERATION, response);
                });
            }
        });
    };

    $scope.updateStoryStatus = function(story, isTask) {
        isTask = typeof isTask === 'undefined' ? true : isTask;
        var index = Configuration.getUpdateStoryStatusOnAllTaskCompletion();
        if (isTask && index !== -1) {
            for (var i = 0, l = story.tasks.length; i < l; i++) {
                if (story.tasks[i].status !== $scope.tasksStatuses.length - 1) {
                    return;
                }
            }
            $scope.updateStory('status', index, story.id);
            story.status = index;
        }
    };

    $scope.updateIterationStatus = function(isStory) {
        isStory = typeof isStory === 'undefined' ? true : isStory;
        if (isStory) {
            $scope.$broadcast(Flow.UPDATE_ITERATION_STATUS);
        }
    };

    $scope.toggleTasks = function($event) {
        var tmp = $($event.currentTarget);
        tmp.parents('tbody').toggleClass('active');
    };

    $scope.setStory = function(story) {
        $scope.activeStory = story;
    };

    var showEditForm = function() {
        $scope.editModal.modal({ keyboard: false });
        $scope.editModal.modal('show');
    };
});
