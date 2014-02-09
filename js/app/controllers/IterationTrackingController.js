'use strict';

cloudScrum.controller('IterationTrackingController', function IterationTrackingController($scope, $rootScope, $location, $timeout, Google, Flow) {

    $scope.stories = [];

    $scope.statusesInfo = [ //TODO grab from config
        'Not started', 'In progress', 'Completed', 'Testing', 'Accepted', 'Blocked'
    ];

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
                    $scope.stories = data[0].stories;
                }, function(error) {
                    alert('handle error: ' + error); //todo handle error
                }).finally(function() {
                    $rootScope.loading = false;
                });
            }
        });
    });

    $scope.toggleTasks = function($event, storyId) {
        var tmp = $($event.currentTarget);
        tmp.parents('tbody').find('[data-story=\''+ storyId +'\']').toggleClass('visible');
        tmp.html(tmp.html() === '+' ? '-' : '+');
    };

    $scope.showStoryDetails = function(story) {
        console.log(story);
    };

    $scope.showTaskDetails = function(task) {

    };
});