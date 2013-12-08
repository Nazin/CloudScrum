'use strict';

cloudScrum.controller('StoryBoardController', function StoryBoardController($scope, $rootScope, $location, Google) {

    Google.login().then(function() {
        var releaseId = $rootScope.getReleaseId();
        if (typeof releaseId === 'undefined') {
            $location.path('/backlog');
        } else {
            Google.getReleaseStories(releaseId).then(function(data) {
                console.log(data);
            }, function(error) {
                alert('handle error: ' + error); //todo handle error
            }).finally(function() {
                $rootScope.loading = false;
            });
        }
    });
});