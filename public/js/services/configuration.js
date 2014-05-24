'use strict';

cloudScrum.service('Configuration', function Configuration($q, $http,Flow) {

    var self = this, configurationReceived = false, defaultConfiguration = {
        storiesStatuses: ['', 'In progress', 'Completed', 'Blocked', 'Accepted'],
        taskStatuses: ['', 'In progress', 'Testing', 'Blocked', 'Completed']
    }, configuration = {}, users = [];

    self.loadConfiguration = function(forceToRefresh) {

        forceToRefresh = forceToRefresh || false;

        var deferred = $q.defer();

        if (forceToRefresh || !configurationReceived) {
            $http.get('/configuration', { params: { path: Flow.getActiveProjectInfo().path } }).success(function(response) {
                configuration = response.configuration;
                users = response.users;
                deferred.resolve();
                configurationReceived = true;
            });
        } else {
            deferred.resolve();
        }

        return deferred.promise;
    };

    self.getStoriesStatuses = function() {
        return configuration.storiesStatuses || defaultConfiguration.storiesStatuses;
    };

    self.getAcceptedStatusIndex = function() {
        var storiesStatuses = self.getStoriesStatuses();
        return storiesStatuses.length - 1;
    };

    self.getTasksStatuses = function() {
        return configuration.taskStatuses || defaultConfiguration.taskStatuses;
    };

    self.getUsers = function() {
        return users;
    };
});
