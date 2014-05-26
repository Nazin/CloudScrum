'use strict';

cloudScrum.controller('ConfigurationController', function ConfigurationController($rootScope, $scope, $timeout, Flow, Configuration, growlNotifications) {

    $rootScope.selectProject();

    Configuration.loadConfiguration().then(function() {
        $scope.storiesStatuses = Configuration.getStoriesStatuses();
        $scope.tasksStatuses = Configuration.getTasksStatuses();
        $scope.updateStoryStatusOnAllTaskCompletion = Configuration.getUpdateStoryStatusOnAllTaskCompletion();
        $rootScope.loading = false;
    });

    $scope.addStoriesStatus = function() {
        $scope.storiesStatuses.splice($scope.storiesStatuses.length - 1, 0, '');
        $scope.save('storiesStatuses');
    };

    $scope.removeStoriesStatus = function(index) {
        if (!form('storiesStatuses').isBlocked()) {
            $scope.storiesStatuses.splice(index, 1);
            $scope.save('storiesStatuses');
        }
    };

    $scope.addStoriesStatus = function() {
        $scope.storiesStatuses.splice($scope.storiesStatuses.length - 1, 0, '');
        $scope.save('storiesStatuses');
    };

    $scope.removeTasksStatus = function(index) {
        if (!form('tasksStatuses').isBlocked()) {
            $scope.tasksStatuses.splice(index, 1);
            $scope.save('tasksStatuses');
        }
    };

    $scope.addTasksStatus = function() {
        $scope.tasksStatuses.splice($scope.tasksStatuses.length - 1, 0, '');
        $scope.save('tasksStatuses');
    };

    $scope.saveUpdateStoryStatusOnAllTaskCompletion = function() {
        $timeout(function() {
            $scope.updateStoryStatusOnAllTaskCompletion = parseInt($scope.updateStoryStatusOnAllTaskCompletion);
            $scope.save('updateStoryStatusOnAllTaskCompletion');
        });
    };

    $scope.save = function(configuration) {

        $timeout(function() {

            if (!form(configuration).block()) {
                return;
            }

            Configuration.saveConfiguration(configuration, $scope[configuration], function() {
                form(configuration).unblock();
                growlNotifications.add('Configuration saved', 'success', 2000);
            });
        });
    };

    var forms = {}, form = function(configuration) {

        if (typeof forms[configuration] === 'undefined') {
            forms[configuration] = $('form[name=' + configuration + 'Form]');
        }

        return forms[configuration];
    };
});
