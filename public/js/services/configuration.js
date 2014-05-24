'use strict';

cloudScrum.service('Configuration', function Configuration() {

    //TODO grab from file
    var self = this, storiesStatuses = ['', 'In progress', 'Completed', 'Blocked', 'Accepted'], taskStatuses = ['', 'In progress', 'Testing', 'Blocked', 'Completed'];

    self.getStoriesStatuses = function() {
        return storiesStatuses;
    };

    self.getAcceptedStatusIndex = function() {
        return storiesStatuses.length - 1;
    };

    self.getTasksStatuses = function() {
        return taskStatuses;
    };
});
