'use strict';

cloudScrum.controller('BacklogController', function BacklogController($rootScope, $scope, $http, Flow) {

    $rootScope.selectProject();

    $scope.stories = [];
    $scope.newStoryModal = $('#new-story-modal');

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

    newStory();

    $scope.saveStory = function() {

        if (!$scope.newStoryModal.block()) {
            return;
        }

        $scope.story.position = $scope.stories.length;

        $http.post('/backlog', { story: $scope.story, project: Flow.getActiveProjectInfo() }).success(function(response) {
            $scope.story.id = response.data.id;
            $scope.stories.push(JSON.parse(JSON.stringify($scope.story)));
            $scope.newStoryModal.modal('hide');
            $rootScope.newProjectModal.unblock();
            newStory();
        });
    };

    $scope.updateStory = function(field, value, id, event) {
        if ($scope.editStoryForm.$valid) {
            $http.put('/backlog/' + id, { field: field, value: value, project: Flow.getActiveProjectInfo() }).success(function(response) {

            });
            //TODO event pobranie target elementu, dolozenie disabled i loadingu z boku
            console.log(field, value, id, event);
        }
    };
});
