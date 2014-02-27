'use strict';

cloudScrum.controller('IterationTrackingController', function IterationTrackingController($scope, $rootScope, $location, $timeout, Google, Flow, Configuration) {

    $scope.iterations = [];
    $scope.stories = [];
    $scope.storiesStatusesInfo = Configuration.getStoriesStatuses();
    $scope.tasksStatusesInfo = Configuration.getTasksStatuses();
    $scope.users = [];
    $scope.unsaved = false;
    $scope.saving = false;
    $scope.taskStatus = $scope.tasksStatusesInfo[0];
    $scope.newTaskModal = $('#new-task-modal');

    Google.login().then(function() {
        Flow.on(function() {
            var releaseId = Flow.getReleaseId();
            if (typeof releaseId === 'undefined') {
                $timeout(function() {
                    $location.path('/backlog');
                }, 100);//instant redirect is causing some unexpected behaviour with sortable widget
            } else {
                Google.getReleaseStories(releaseId).then(function(data) {
                    //TODO take current iteration, allow to change
                    $scope.iterations = data;
                    $scope.stories = $scope.iterations[0].stories;
                }, function(error) {
                    alert('handle error: ' + error); //todo handle error
                }).finally(function() {
                    $rootScope.loading = false;
                });
                Google.getPermissionsList(Flow.getCompanyId()).then(function(users) {
                    $scope.users = users;
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
        $scope.activeStory.tasks.push({
            id: 'T-' + ($scope.activeStory.tasks.length + 1),
            title: $scope.taskTitle,
            estimate: $scope.taskEstimate,
            owner: $scope.taskOwner,
            status: $scope.taskStatus,
            details: typeof $scope.taskDetails === 'undefined' ? '' : $scope.taskDetails
        });
        $scope.taskTitle = '';
        $scope.taskEstimate = '';
        $scope.taskOwner = '';
        $scope.taskStatus = $scope.tasksStatusesInfo[0];
        $scope.taskDetails = '';
        $scope.newTaskModal.modal('hide');
        //TODO save timeout (10s?) + ng-disabled on save button (when saving)
    };

    $scope.showStoryDetails = function(story) {
        console.log(story);
        alert('display story popup');
    };

    $scope.showTaskDetails = function(task) {
        console.log(task);
        alert('display task popup');
    };

    $scope.edit = function() {
        $scope.unsaved = true;
    };
});