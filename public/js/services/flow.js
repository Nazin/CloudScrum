'use strict';

cloudScrum.service('Flow', function Flow($q, $localStorage, $rootScope) {

    var self = this;

    self.UPDATE_ITERATION_STATUS = 1000;
    self.CLOSE_ITERATION = 1001;

    self.isInitialized = function() {
        return $localStorage.cloudScrumInitialized || false;
    };

    self.getUsername = function() {
        return $localStorage.cloudScrumUsername;
    };

    self.getEmail = function() {
        return $localStorage.cloudScrumEmail;
    };

    self.setUser = function(email, username) {
        $localStorage.cloudScrumUsername = username;
        $localStorage.cloudScrumEmail = email;
        $rootScope.initialized = $localStorage.cloudScrumInitialized = true;
    };

    self.getProjects = function() {
        return $localStorage.cloudScrumProjects || [];
    };

    self.addProject = function(name, path) {
        var projects = self.getProjects(), size = projects.push({name: name, 'path': path});
        $rootScope.projects = $localStorage.cloudScrumProjects = projects;
        self.setActiveProject(size - 1);
    };

    self.getActiveProject = function() {
        return $localStorage.cloudScrumActiveProject;
    };

    self.getActiveProjectInfo = function() {
        return self.getProjects()[$localStorage.cloudScrumActiveProject];
    };

    self.setActiveProject = function(id) {
        $rootScope.activeProject = $localStorage.cloudScrumActiveProject = id || 0;
    };

    self.checkProjectExistence = function(name, path) {

        var projects = self.getProjects();

        for (var i = 0, l = projects.length; i < l; i++) {
            if (projects[i].name === name) {
                return 'Project with given name already exists';
            }
            if (projects[i].path === path) {
                return 'Project with given path already exists';
            }
        }

        return '';
    };

    self.setActiveRelease = function(name, iteration) {
        $localStorage.cloudScrumActiveRelease = name;
        self.setActiveIteration(iteration);
    };

    self.setActiveIteration = function(iteration) {
        $localStorage.cloudScrumActiveIteration = iteration || 1;
    };

    self.getActiveRelease = function() {
        return $localStorage.cloudScrumActiveRelease;
    };

    self.getActiveIteration = function() {
        return $localStorage.cloudScrumActiveIteration;
    };

    self.getNewTask = function() {
        return {
            title: '',
            estimate: undefined,
            effort: 0,
            owner: '',
            status: 0,
            details: ''
        };
    };
});
