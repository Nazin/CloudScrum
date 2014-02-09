'use strict';

var cloudScrum = angular.module('cloudScrum', ['ngRoute', 'ngStorage', 'ui.sortable']);

cloudScrum.config(function($routeProvider) {

    $routeProvider.when('/', {
        controller: 'DashboardController',
        templateUrl: 'views/dashboard.tpl',
        title: 'Dashboard'
    }).when('/auth', {
        controller: 'AuthController',
        templateUrl: 'views/auth.tpl',
        title: 'Authorization'
    }).when('/projects', {
        controller: 'ProjectsController',
        templateUrl: 'views/projects.tpl',
        title: 'Projects',
        nameInBreadcrumb: false
    }).when('/backlog', {
        controller: 'BacklogController',
        templateUrl: 'views/backlog.tpl',
        title: 'Backlog'
    }).when('/story-board', {
        controller: 'StoryBoardController',
        templateUrl: 'views/story-board.tpl',
        title: 'Story board'
    }).when('/iteration-tracking', {
        controller: 'IterationTrackingController',
        templateUrl: 'views/iteration-tracking.tpl',
        title: 'Iteration tracking'
    }).when('/users', {
        controller: 'UsersController',
        templateUrl: 'views/users.tpl',
        title: 'Users'
    });
});

cloudScrum.run(function($rootScope, $route, $location, $localStorage, Google, Flow) {

    $rootScope.loading = true;
    $rootScope.authorized = false;
    $rootScope.companies = [];
    $rootScope.newCompanyModal = $('#new-company-modal');

    Google.login().then(function() {

        $rootScope.authorized = true;

        Google.findCompaniesFiles().then(function(files) {
            if (files.length === 0) {
                $rootScope.companyModalVisible = true;
                $rootScope.newCompanyModal.modal('show');
                var tmp = $('#new-project-modal');
                if (tmp.length) {
                    tmp.modal('hide');
                }
            } else {
                $rootScope.companyModalVisible = false;
                for (var i=0; i<files.length; i++) {
                    $rootScope.companies.push({id: files[i].id, name: files[i].title.replace('CloudScrum-', '')});
                }
            }
        });
    }, function() {
        $rootScope.authorized = false;
        if ($location.$$path !== '/auth') {
            $location.path('/auth');
        }
    });

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
        if (!Google.isAuthorized() && current.slice(-5) === '/auth' && next !== current) {
            event.preventDefault();
        } else {
            $rootScope.loading = true;
        }
    });

    $rootScope.$on('$routeChangeSuccess', function(event, current) {
        $rootScope.page = current.$$route.controller;
        $rootScope.nameInBreadcrumb = typeof current.$$route.nameInBreadcrumb === 'undefined' ? true : current.$$route.nameInBreadcrumb;
        $rootScope.title = current.$$route.title;
    });

    $rootScope.createCompany = function() {

        $rootScope.loading = true;
        $rootScope.newCompanyModal.modal('hide');
        $rootScope.companyModalVisible = false;

        Google.createFolder('CloudScrum-' + $rootScope.companyName).then(function(file) {
            var company = {id: file.id, name: $rootScope.companyName};
            $rootScope.companyName = '';
            $rootScope.companies.push(company);
            $rootScope.loadCompany(company, true);
        }, function(error) {
            alert('handle error: ' + error); //todo
        }).finally(function() {
            $rootScope.loading = false;
        });
    };

    $rootScope.loadCompany = function(company, newCompany) {

        newCompany = newCompany || false;
        Flow.setCompany(company.id, company.name, newCompany);

        if ($location.path() === '/projects') {
            $route.reload();
        } else {
            $location.path('/projects')
        }
    };
});

var googleLoaded = function() {

    var scope = angular.element(document);

    scope.ready(function() {
        angular.bootstrap(document, ['cloudScrum']);
        scope.injector().get('Google').handleClientLoad();
    });
};