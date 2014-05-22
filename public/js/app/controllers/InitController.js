'use strict';

cloudScrum.controller('InitController', function InitController($rootScope, $scope, $location, Flow) {

    $rootScope.loading = false;

    $scope.username = Flow.getUsername();
    $scope.email = Flow.getEmail();

    $scope.saveUser = function() {

        Flow.setUser($scope.email, $scope.username);

        var projects = Flow.getProjects();

        if (projects.length === 0) {
            $rootScope.newProjectModal.modal({ keyboard: false });
            $rootScope.newProjectModal.modal('show');
        } else {
            $rootScope.selectProject(true);
        }
    };
});
