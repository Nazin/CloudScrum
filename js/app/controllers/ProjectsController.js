'use strict';

cloudScrum.controller('ProjectsController', function ProjectsController($scope, $rootScope, $location, $localStorage, Google) {

    $scope.newProjectModal = $('#new-project-modal');
    $scope.projectFileId = $localStorage.cloudScrumProjectFileId;
    $scope.projects = [];

    Google.login().then(function() {
        Google.findProjectsFiles($localStorage.cloudScrumCompanyFileId).then(function(files) {
            if (files.length === 0) {
                $scope.newProjectModal.modal('show');
            } else {
                for (var i=0; i<files.length; i++) {
                    $scope.projects.push({id: files[i].id, name: files[i].title});
                }
            }
        }, function(error) {
            alert('handle error: ' + error); //todo
        }).finally(function() {
            $rootScope.loading = false;
        });
    });

    $scope.createProject = function() {

        $rootScope.loading = true;
        $scope.newProjectModal.modal('hide');

        Google.createFolder($scope.projectName, $localStorage.cloudScrumCompanyFileId).then(function(file) {

            $localStorage.cloudScrumProjectFileId = file.id;
            $scope.projects.push({id: file.id, name: $scope.projectName});
            $scope.projectName = '';

            Google.createSpreadsheet('backlog', file.id).then(function(file) {
                $localStorage.cloudScrumBacklogFileId = file.id;
                $location.path('/backlog');
            }, function(error) {
                alert('handle error: ' + error); //todo
            }).finally(function() {
                $rootScope.loading = false;
            });
        }, function(error) {
            alert('handle error: ' + error); //todo
            $rootScope.loading = false;
        });
    };

    $scope.loadProject = function(project) {

        $rootScope.loading = true;

        Google.findBacklog(project.id).then(function(files) {
            $localStorage.cloudScrumProjectFileId = project.id;
            $localStorage.cloudScrumBacklogFileId = files[0].id;
            $location.path('/backlog');
        }, function(error) {
            alert('handle error: ' + error); //todo
            $rootScope.loading = false;
        });
    };
});