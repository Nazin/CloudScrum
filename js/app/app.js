'use strict';

var cloudScrum = angular.module('cloudScrum', ['ngRoute', 'ui.sortable']);

cloudScrum.config(function($routeProvider) {

    $routeProvider.when('/', {
        controller: 'DashboardController',
        templateUrl: 'views/dashboard.tpl',
        title: 'Dashboard'
    }).when('/backlog', {
        controller: 'BacklogController',
        templateUrl: 'views/backlog.tpl',
        title: 'Backlog'
    }).when('/story-board', {
        controller: 'StoryBoardController',
        templateUrl: 'views/story-board.tpl',
        title: 'Story board'
    });
});

cloudScrum.run(function($rootScope, $location) {

    $rootScope.loading = true;

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
        $rootScope.loading = true;
    });

    $rootScope.$on('$routeChangeSuccess', function(event, current) {
        $rootScope.page = current.$$route.controller;
        $rootScope.title = current.$$route.title;
    });
});

var googleLoaded = function() {

    var scope = angular.element(document);

    scope.ready(function() {
        angular.bootstrap(document, ['cloudScrum']);
    });
};