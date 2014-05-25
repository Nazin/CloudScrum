'use strict';

cloudScrum.controller('TaskBoardController', function TaskBoardController($scope, $http, Configuration, Flow) {

    $scope.hideTaskStatusInEditModal = true;

    var configurationLoaded = false, iterationsLoaded = false;

    Configuration.loadConfiguration().then(function() {
        configurationLoaded = true;
        $scope.storiesStatuses = Configuration.getStoriesStatuses();
        $scope.tasksStatuses = Configuration.getTasksStatuses();
        $scope.usersMapping = {};
        $scope.users = Configuration.getUsers();
        for (var i = 0, l = $scope.users.length; i < l; i++) {
            $scope.usersMapping[$scope.users[i].email] = $scope.users[i].name;
        }
        if (iterationsLoaded) {
            transferStoriesToTaskBoard();
        }
    });

    $scope.loadIterationCallback = function(iteration) {
        iterationsLoaded = true;
        $scope.iteration = iteration;
        if (configurationLoaded) {
            transferStoriesToTaskBoard();
        }
    };

    var transferStoriesToTaskBoard = function() {
        var stories = $scope.iteration.stories;
        for (var i = 0, l = stories.length; i < l; i++) {
            var story = stories[i];
            story.tasksByStatus = [];
            for (var k = 0, lk = $scope.tasksStatuses.length; k < lk; k++) {
                story.tasksByStatus.push([]);
            }
            for (var j = 0, lj = story.tasks.length; j < lj; j++) {
                story.tasks[j].id = j;
                story.tasksByStatus[story.tasks[j].status].push(story.tasks[j]);
            }
            updateSortableOptions(story);
        }
    };

    var orderChanged = false, changedToStatus = 0;

    var updateSortableOptions = function(story) {
        $scope.sortableOptions[story.id] = {
            start: function() {
                orderChanged = false;
            },
            stop: function(event, ui) {
                if (orderChanged) {

                    var id = ui.item.data('story'), tid = ui.item.data('task'), task = $('.task[data-story=' + id + '][data-task=' + tid + ']'),
                        storyObj = $scope.iteration.stories[ui.item.data('story-index')],
                        taskObj = storyObj.tasks[tid],
                        request = { field: 'status', value: changedToStatus, project: Flow.getActiveProjectInfo(), name: Flow.getActiveRelease() };

                    task.addClass('disabled');
                    taskObj.status = changedToStatus;

                    if (taskObj.owner === '' || taskObj.owner === null) {
                        taskObj.owner = Flow.getEmail();
                        request.field = ['status', 'owner'];
                        request.value = [changedToStatus, taskObj.owner];
                    }

                    $http.put('/iteration/' + Flow.getActiveIteration() + '/' + id + '/tasks/' + tid, request).success(function() {
                        task.removeClass('disabled');
                    });

                    var index = Configuration.getUpdateStoryStatusOnAllTaskCompletion();
                    if (index !== -1) {
                        for (var i = 0, l = storyObj.tasks.length; i < l; i++) {
                            if (storyObj.tasks[i].status !== $scope.tasksStatuses.length - 1) {
                                return;
                            }
                        }
                        $http.put('/iteration/' + Flow.getActiveIteration() + '/' + id, { field: 'status', value: index, project: Flow.getActiveProjectInfo(), name: Flow.getActiveRelease() }).success(function() {});
                        storyObj.status = index;
                    }
                }
            },
            update: function(event) {
                orderChanged = true;
                changedToStatus = parseInt($(event.target).data('status'));
            },
            connectWith: '.tasks_' + story.id,
            items: '.task',
            cancel: '.disabled'
        };
    };

    $scope.sortableOptions = [];
});
