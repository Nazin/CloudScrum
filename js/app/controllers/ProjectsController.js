'use strict';

cloudScrum.controller('ProjectsController', function ProjectsController($scope, $rootScope, $location, Google) {

    $scope.newProjectModal = $('#new-project-modal');
    $scope.projectFileId = $rootScope.getProjectId();
    $scope.projects = [];

    Google.login().then(function() {
        Google.findProjectsFiles($rootScope.getCompanyId()).then(function(files) {
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

        Google.createFolder($scope.projectName, $rootScope.getCompanyId()).then(function(file) {

            $scope.projects.push({id: file.id, name: $scope.projectName});

            Google.createSpreadsheet('backlog', file.id).then(function(file2) {
                $rootScope.setProject(file.id, $scope.projectName, file2.id);
                $scope.projectName = '';
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
            $rootScope.setProject(project.id, project.name, files[0].id);
            $location.path('/backlog');
        }, function(error) {
            alert('handle error: ' + error); //todo
            $rootScope.loading = false;
        });
    };
});