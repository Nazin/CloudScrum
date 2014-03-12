'use strict';

cloudScrum.controller('IterationStatusController', function IterationStatusController($scope, $rootScope, Google, Flow) {

    $scope.iteration = {};
    $scope.iterations = [];
    $scope.releases = {};
    $scope.storyPointsEstimated = 0;
    $scope.storyPointsAccepted = 0;
    $scope.percentCompleted = ($scope.storyPointsAccepted/$scope.storyPointsEstimated)*100;

    var oldReleaseSelected = undefined;

    $scope.$on('PARENT_READY', function(event, data){
        loadRelease(data.releaseId);
        Google.getPermissionsList(Flow.getCompanyId()).then(function(users) {
            $scope.users = users;
        });
    });

    $scope.changeRelease = function() {

        if ($scope.unsaved && !confirm('There are some unsaved changes which you will lost! Do you really want to change the release?')) {
            $scope.release = oldReleaseSelected;
            return;
        }

        loadRelease($scope.release.id);
    };

    $scope.updateStoryPoints = function() {

        var estimated = 0, accepted = 0;

        for (var i= 0, l=$scope.iteration.stories.length; i<l ;i++) {

            var tmp = parseInt($scope.iteration.stories[i].estimate);
            estimated += tmp;

            if ($scope.iteration.stories[i].status === $scope.storiesStatusesInfo[$scope.storiesStatusesInfo.length-1]) {
                accepted += tmp;
            }
        }

        $scope.storyPointsEstimated = estimated;
        $scope.storyPointsAccepted = accepted;
        $scope.percentCompleted = ($scope.storyPointsAccepted/$scope.storyPointsEstimated)*100;
    };

    var loadRelease = function(id) {

        $rootScope.loading = true;

        Flow.setRelease(id);

        Google.getReleaseStories(id).then(function(data) {

            $scope.iterations = data;
            $scope.iteration = _.find($scope.iterations, function(iteration) {return !iteration.closed;});

            if (typeof $scope.iteration === 'undefined') {
                $scope.iteration = $scope.iterations[$scope.iterations.length-1];
            }

            $scope.updateStoryPoints();

            $scope.releases = Flow.getReleases();
            $scope.release = $scope.releases[id];
            oldReleaseSelected = $scope.release;

            $scope.loadReleaseCallback($scope.iteration);
        }, function(error) {
            alert('handle error: ' + error); //todo handle error
        }).finally(function() {
            $rootScope.loading = false;
        });
    };
});