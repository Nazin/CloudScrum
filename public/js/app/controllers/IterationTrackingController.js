'use strict';

cloudScrum.controller('IterationTrackingController', function IterationTrackingController($scope, Configuration) {

    $('.modal-backdrop').remove();

    Configuration.loadConfiguration().then(function() {
        $scope.storiesStatuses = Configuration.getStoriesStatuses();
        $scope.tasksStatuses = Configuration.getTasksStatuses();
        $scope.users = Configuration.getUsers();
    });

    $scope.loadIterationCallback = function(iteration) {
        $scope.iteration = iteration;
    };

    $scope.toggleTasks = function($event) {
        var tmp = $($event.currentTarget);
        tmp.parents('tbody').toggleClass('active');
    };
});
