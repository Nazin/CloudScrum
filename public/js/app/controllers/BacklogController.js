'use strict';

cloudScrum.controller('BacklogController', function BacklogController($rootScope, $scope, $http, Flow) {

    $rootScope.selectProject();

    $scope.stories = [];
    $scope.newStoryModal = $('#new-story-modal');
    $scope.newTaskModal = $('#new-task-modal');

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
            status: '',
            position: 0,
            details: '',
            tasks: []
        };
    };

    var newTask = function() {
        $scope.task = {
            title: '',
            estimate: undefined,
            effort: 0,
            owner: '',
            status: '',
            details: ''
        };
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
});
