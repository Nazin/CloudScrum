'use strict';

cloudScrum.service('Configuration', function Configuration() {

    var self = this;

    self.getStoriesStatuses = function() {
        return ['Not started', 'In progress', 'Completed', 'Testing', 'Blocked', 'Accepted']; //TODO grab from google drive?
    };

    self.getTasksStatuses = function() {
        return ['Not started', 'In progress', 'Blocked', 'Completed']; //TODO grab from google drive?
    };
});