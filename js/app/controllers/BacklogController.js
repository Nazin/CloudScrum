'use strict';
//TODO on exit -> if unsaved, alert!
cloudScrum.controller('BacklogController', function BacklogController($scope, $rootScope, $location, $window, Google) {

    Google.login().then(function() {
        var backlogId = $rootScope.getBacklogId();
        if (typeof backlogId === 'undefined') {
            $location.path('/projects');
        } else {
            Google.getBacklogStories($rootScope.getBacklogId()).then(function(data) {
                $scope.stories = data.stories;
                $scope.nextStoryId = data.maxId+1;
            }, function(error) {
                alert('handle error: ' + error); //todo
            }).finally(function() {
                $rootScope.loading = false;
            });
        }
    });

    $scope.planning = false;
    $scope.unsaved = false;
    $scope.saving = false;
    $scope.sortable = false;
    $scope.stories = [];
    $scope.nextStoryId = 1;
    $scope.newStoryModal = $('#new-story-modal');

    $scope.sortableOptions = {
        stop: function() {

            var sp = 0, it = 1;

            for (var i = 0; i < $scope.stories.length; i++) {
                if (typeof $scope.stories[i].ruler === 'undefined') {
                    sp += $scope.stories[i].estimate;
                } else {

                    $scope.stories[i].points = sp;
                    $scope.stories[i].iteration = it++;

                    sp = 0;
                }
            }
        },
        update: function(e, ui) {
            if (!$scope.planning) {
                $scope.unsaved = true;
                //TODO save timeout (10s?)
            }
        },
        axis: 'y',
        cancel: '.disabled'
    };

    $scope.createStory = function() {
        $scope.unsaved = true;
        $scope.stories.push({
            id: 'S-' + ($scope.nextStoryId++),
            title: $scope.storyTitle,
            epic: typeof $scope.storyEpic === 'undefined' ? '' : $scope.storyEpic,
            estimate: $scope.storyEstimate,
            details: typeof $scope.storyDetails === 'undefined' ? '' : $scope.storyDetails
        });
        $scope.storyTitle = '';
        $scope.storyEpic = '';
        $scope.storyEstimate = '';
        $scope.storyDetails = '';
        $scope.newStoryModal.modal('hide');
        //TODO save timeout (10s?)
    };

    $scope.saveStories = function() {

        $rootScope.loading = true;

        if (!$scope.saving) {

            $scope.saving = true;

            Google.saveBacklogStories($scope.stories, $rootScope.getBacklogId(), $rootScope.getProjectName()).then(function() {
                $scope.unsaved = false;
            }, function(error) {
                alert('handle error: ' + error); //todo
            }).finally(function() {
                $rootScope.loading = false;
                $scope.saving = false;
            });
        }
    };

    $scope.planRelease = function() {

        $scope.planning = !$scope.planning;

        if ($scope.planning) {
            $scope.stories.unshift({ruler: true, points: 0, iteration: 1});
        } else {
            //todo remove all rulers
        }
    };

    $scope.edit = function() {
        $scope.unsaved = true;
    };
});