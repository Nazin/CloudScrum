'use strict';

var cloudScrum = angular.module('cloudScrum', ['ngRoute', 'ngStorage', 'ui.sortable']);

cloudScrum.config(function($routeProvider) {

    $routeProvider.when('/', {
        controller: 'DashboardController',
        templateUrl: 'views/dashboard.tpl',
        title: 'Dashboard'
    }).when('/init', {
        controller: 'InitController',
        templateUrl: 'views/init.tpl',
        title: 'Application initialization'
    }).when('/projects', {
        controller: 'ProjectsController',
        templateUrl: 'views/projects.tpl',
        title: 'Projects'
    }).when('/backlog', {
        controller: 'BacklogController',
        templateUrl: 'views/backlog.tpl',
        title: 'Backlog'
    });
});

cloudScrum.run(function($rootScope, Flow, $location, $http) {

    $rootScope.loading = true;
    $rootScope.initialized = Flow.isInitialized();
    $rootScope.projects = Flow.getProjects();
    $rootScope.activeProject = Flow.getActiveProject();
    $rootScope.newProjectModal = $('#new-project-modal');
    $rootScope.projectCreationError = '';

    if (!Flow.isInitialized() && $location.$$path !== '/init') {
        $location.path('/init');
    }

    if (Flow.isInitialized() && $rootScope.projects.length === 0) {
        $rootScope.newProjectModal.modal({ keyboard: false });
        $rootScope.newProjectModal.modal('show');
    }

    $rootScope.createProject = function() {

        $rootScope.projectCreationError = Flow.checkProjectExistence($rootScope.projectName, $rootScope.projectPath);

        if ($rootScope.projectCreationError !== '') {
            return;
        }

        if (!$rootScope.newProjectModal.block()) {
            return;
        }

        $http.post('/projects', { name: $rootScope.projectName, path: $rootScope.projectPath, user: { name: Flow.getUsername(), email: Flow.getEmail() } }).success(function(response) {

            if (response.status === 'success') {

                $rootScope.projectCreationError = '';
                Flow.addProject($rootScope.projectName, $rootScope.projectPath);

                $rootScope.projectName = '';
                $rootScope.projectPath = '';

                $rootScope.newProjectModal.modal('hide');
                $location.path('/backlog');
                //TODO ask for users (Flow.getUsers())
            } else {
                $rootScope.projectCreationError = response.message;
            }

            $rootScope.newProjectModal.unblock();
        });
    };

    $rootScope.loadProject = function(index) {
        Flow.setActiveProject(index);
        $location.path('/');
    };

    $rootScope.selectProject = function(redirect) {

        redirect = redirect || false;

        if (typeof Flow.getActiveProject() !== 'undefined') {
            if (redirect) {
                $location.path('/');
            }
        } else {
            if ($rootScope.projects.length === 1) {
                Flow.setActiveProject();
                if (redirect) {
                    $location.path('/');
                }
            } else {
                $location.path('/projects');
            }
        }
    };

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
        if (!Flow.isInitialized() && current.slice(-5) === '/init' && next !== current) {
            event.preventDefault();
        } else {
            $rootScope.loading = true;
        }
    });

    $rootScope.$on('$routeChangeSuccess', function(event, current) {
        $rootScope.page = current.$$route.controller;
        $rootScope.title = current.$$route.title;
    });
});
