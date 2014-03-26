'use strict';

cloudScrum.controller('IterationTrackingController', function IterationTrackingController($scope, $rootScope, $location, $timeout, Google, Flow, Configuration) {

    $scope.iteration = {};
    $scope.storiesStatusesInfo = Configuration.getStoriesStatuses();
    $scope.tasksStatusesInfo = Configuration.getTasksStatuses();
    $scope.users = [];
    $scope.unsaved = false;
    $scope.saving = false;
    $scope.task = {};
    $scope.newTaskModal = $('#new-task-modal');
    $scope.editModal = $('#edit-modal');

    var newTask = function() {
        $scope.task = {
            status: $scope.tasksStatusesInfo[0],
            details: '',
            effort: 0
        };
    };

    var showEditForm = function() {
        $scope.editModal.modal('show');
    };

    newTask();

    Google.login().then(function() {
        Flow.on(function() {
            var releaseId = Flow.getReleaseId();
            if (typeof releaseId === 'undefined') {
                $timeout(function() {
                    $location.path('/backlog');
                }, 100);//instant redirect is causing some unexpected behaviour with sortable widget
            } else {
                $scope.$broadcast('PARENT_READY', {
                    releaseId: releaseId
                });
            }
        });
    });

    $scope.saveRelease = function() {

        $rootScope.loading = true;

        if (!$scope.saving) {

            $scope.saving = true;

            Google.saveRelease(Flow.getReleaseId(), $scope.iterations, Flow.getReleaseName(), false).then(function() {
                $scope.unsaved = false;
            }, function(error) {
                alert('handle error: ' + error); //todo handle error
            }).finally(function() {
                $rootScope.loading = false;
                $scope.saving = false;
            });
        }
    };

    $scope.toggleTasks = function($event) {
        var tmp = $($event.currentTarget);
        tmp.parents('tbody').toggleClass('active');
    };

    $scope.updateEffort = function(story) {

        if (typeof story.effort === 'undefined' || story.effort === null) {
            story.effort = 0;
        }

        var effort = 0;
        for (var i=0; i<story.tasks.length; i++) {
            effort += story.tasks[i]['effort'] ? parseInt(story.tasks[i]['effort']) : 0;
        }

        if (story.effort !== effort) {
            story.effort = effort;
            $scope.edit();
        }
    };

    $scope.setStory = function(story) {
        $scope.activeStory = story;
    };

    $scope.createTask = function() {
        $scope.unsaved = true;
        $scope.task.id = 'T-' + ($scope.activeStory.tasks.length + 1);
        $scope.activeStory.tasks.push(JSON.parse(JSON.stringify($scope.task)));
        newTask();
        $scope.newTaskModal.modal('hide');
        //TODO save timeout (10s?) + ng-disabled on save button (when saving)
    };

    $scope.saveEditedItem = function() {
        $scope.editModal.modal('hide');
    };

    $scope.showStoryDetails = function(story) {
        $scope.editItem = story;
        $scope.editItemStory = true;
        $scope.editItemStatuses = $scope.storiesStatusesInfo;
        showEditForm();
    };

    $scope.showTaskDetails = function(task) {
        $scope.editItem = task;
        $scope.editItemStory = false;
        $scope.editItemStatuses = $scope.tasksStatusesInfo;
        showEditForm();
    };

    $scope.edit = function() {
        $scope.unsaved = true;
        //TODO save timeout (10s?) + ng-disabled on save button (when saving)
    };

    $scope.updateStoryPoints = function() {
        $scope.$broadcast('UPDATE_STORY_POINTS', {});
    };

    $scope.loadIterationCallback = function(iteration, iterations) {
        $scope.iteration = iteration;
        $scope.iterations = iterations;
    };

    $scope.loadReleaseCallback = function(iteration, iterations, users) {
        $scope.loadIterationCallback(iteration, iterations);
        $scope.users = users;
        $scope.unsaved = false;
    };
});