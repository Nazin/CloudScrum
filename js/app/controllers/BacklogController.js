'use strict';
//TODO on exit -> if unsaved, alert!
cloudScrum.controller('BacklogController', function BacklogController($scope, $rootScope, $location, $window, Google) {

    Google.login().then(function() {
        var backlogId = $rootScope.getBacklogId();
        if (typeof backlogId === 'undefined') {
            $location.path('/projects');
        } else {
            Google.getBacklogStories(backlogId).then(function(data) {
                $scope.stories = data.stories;
                $scope.nextStoryId = data.maxId+1;
            }, function(error) {
                alert('handle error: ' + error); //todo handle error
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
    $scope.iterations = 0;
    $scope.newStoryModal = $('#new-story-modal');

    $scope.iterationLength = 7; //TODO obtain from configuration
    $scope.releaseStartDate = moment().add('days', 1).format('YYYY-MM-DD');
    $scope.minReleaseStartDate = moment().format('YYYY-MM-DD');
    $scope.maxReleaseStartDate = moment().add('years', 2).format('YYYY-MM-DD');
    $scope.newReleaseModal = $('#new-release-modal');

    //TODO refresh stories (once per 5 minutes?) if not unsaved

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
        update: function() {
            if (!$scope.planning) {
                $scope.unsaved = true;
                //TODO save timeout (10s?) + ng-disabled on save button (when saving)
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
        //TODO save timeout (10s?) + ng-disabled on save button (when saving)
    };

    $scope.saveStories = function() {

        $rootScope.loading = true;

        if (!$scope.saving) {

            $scope.saving = true;

            Google.saveBacklogStories($scope.stories, $rootScope.getBacklogId(), $rootScope.getProjectName()).then(function() {
                $scope.unsaved = false;
            }, function(error) {
                alert('handle error: ' + error); //todo handle error
            }).finally(function() {
                $rootScope.loading = false;
                $scope.saving = false;
            });
        }
    };

    $scope.planRelease = function() {
        //TODO button for auto planning (available when 1st iteration have some sp)
        $scope.planning = true;
        $scope.stories.unshift({ruler: true, points: 0, iteration: 1});
        $scope.iterations = 1;
    };

    $scope.cancelPlanning = function() {
        if (confirm('Are you sure?')) {//TODO maybe some nicer confirm (not js default)
            $scope.planning = false;
            $scope.iterations = 0;
            for (var i = $scope.stories.length-1; i >= 0 ; i--) {
                if (typeof $scope.stories[i].ruler !== 'undefined') {
                    $scope.stories.splice(i, 1);
                }
            }
        }
    };

    $scope.addIteration = function() {
        for (var i = $scope.stories.length-1; i >= 0 ; i--) {
            if (typeof $scope.stories[i].ruler !== 'undefined') {
                var points = typeof $scope.stories[i+1] !== 'undefined' && typeof $scope.stories[i+1].ruler === 'undefined' ? $scope.stories[i+1].estimate : 0;
                $scope.stories.splice(i+2, 0, {ruler: true, points: points, iteration: $scope.stories[i].iteration+1});
                $scope.iterations++;
                break;
            }
        }
    };

    $scope.removeLastIteration = function() {
        for (var i = $scope.stories.length-1; i >= 0 ; i--) {
            if (typeof $scope.stories[i].ruler !== 'undefined') {
                $scope.stories.splice(i, 1);
                $scope.iterations--;
                break;
            }
        }
    };

    $scope.createRelease = function() {

        $scope.newReleaseModal.modal('hide');
        $rootScope.loading = true;

        var iterations = [], stories = [], iteration = 1;

        for (var i = 0; i < $scope.stories.length; i++) {
            if (typeof $scope.stories[i].ruler === 'undefined') {
                stories.push($scope.stories[i]);
            } else {
                iterations.push({
                    stories: stories.slice(0),
                    startDate: moment($scope.releaseStartDate).add('days', $scope.iterationLength*(iteration-1)).format('YYYY-MM-DD'),
                    endDate: moment($scope.releaseStartDate).add('days', $scope.iterationLength*(iteration++)).format('YYYY-MM-DD')
                });
                stories = [];
            }
        }

        Google.saveRelease($rootScope.getProjectId(), iterations, $scope.releaseName, true).then(function(file) {
            $rootScope.setRelease(file.id, $scope.releaseName);
            //TODO remove stories from backlog
            $location.path('/story-board');
        }, function(error) {
            alert('handle error: ' + error); //todo handle error
            $rootScope.loading = false;
        });
    };

    $scope.edit = function() {
        $scope.unsaved = true;
    };
});