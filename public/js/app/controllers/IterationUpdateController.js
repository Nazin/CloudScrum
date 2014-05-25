'use strict';

cloudScrum.controller('IterationUpdateController', function IterationUpdateController($scope, $http, Configuration, Flow) {

    $scope.$on(Flow.UPDATE_EFFORT, function(message, story) {
        $scope.updateEffort(story);
    });

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

    $scope.updateStory = function(field, value, id, event, isValid) {

        isValid = typeof isValid === 'undefined' ? $scope['editIterationForm'].$valid : isValid;

        if (isValid) {

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

    $scope.updateTask = function(field, value, id, tid, event, isValid) {

        isValid = typeof isValid === 'undefined' ? $scope['editIterationForm'].$valid : isValid;

        if (isValid) {

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

    $scope.updateEditElement = function(field, value, event, valid) {
        if ($scope.editItemStory) {
            $scope.updateStory(field, value, $scope.activeStory.id, event, valid);
        } else {
            $scope.updateTask(field, value, $scope.activeStory.id, $scope.activeTaskId, event, valid);
        }
    };

    $scope.setStory = function(story) {
        $scope.activeStory = story;
        if (typeof $scope.setStoryCallback !== 'undefined') {
            $scope.setStoryCallback(story);
        }
    };

    var showEditForm = function() {
        $scope.editModal = $scope.editModal || $('#edit-modal');
        $scope.editModal.modal({ keyboard: false });
        $scope.editModal.modal('show');
    };
});
