<div ng-controller="IterationUpdateController">

    <div ng-include src="'views/partial/iteration-status.tpl'"></div>

    <p class="clearfix buttons-nav">
        <button type="button" class="btn btn-info pull-right" ng-click="closeIteration()" ng-show="currentIteration === release.activeIteration && currentIteration !== release.iterations">Close iteration</button>
        <button type="button" class="btn btn-info pull-right" ng-click="closeRelease()" ng-show="!release.closed && currentIteration === release.activeIteration && currentIteration === release.iterations">Close release</button>
    </p>

    <form role="form" class="form-inline" name="editIterationForm" novalidate>
        <table class="table" id="iteration-tracking">
            <thead>
                <tr>
                    <th></th>
                    <th>Id</th>
                    <th>Epic</th>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Estimate</th>
                    <th>Effort</th>
                </tr>
            </thead>
            <tbody ng-repeat="story in iteration.stories">
                <tr>
                    <td><span ng-click="toggleTasks($event)"></span></td>
                    <td>{{ story.id }}</td>
                    <td>{{ story.epic }}</td>
                    <td ng-bs-popover>
                        <a href="" ng-click="showStoryDetails(story)" class="popover-toggle" data-container="body" data-trigger="hover" data-placement="bottom" data-content="{{ story.details ? story.details : ' ' }}">{{ story.title }}</a>
                    </td>
                    <td>
                        <div class="form-group">
                            <select name="owner" class="form-control input-sm" ng-model="story.owner" ng-options="user.email as user.name for user in users" ng-select-value-change="updateStory($field, $value, story.id, $event)" ng-disabled="iteration.closed">
                                <option value=""></option>
                            </select>
                        </div>
                    </td>
                    <td>
                        <div class="form-group">
                            <select name="status" class="form-control input-sm" ng-model="story.status" ng-options="id*1 as name for (id, name) in storiesStatuses" ng-select-value-change="updateStory($field, $value, story.id, $event)" ng-change="updateIterationStatus();" ng-disabled="iteration.closed"></select>
                        </div>
                    </td>
                    <td>{{ story.estimate }} SP</td>
                    <td>{{ story.effort ? story.effort : 0 }} h</td>
                </tr>
                <tr class="task" ng-repeat="task in story.tasks">
                    <td colspan="3"></td>
                    <td ng-bs-popover>
                        <a href="" ng-click="setStory(story);showTaskDetails(task, $index);" class="popover-toggle" data-container="body" data-trigger="hover" data-placement="bottom" data-content="{{ task.details ? task.details : ' ' }}">{{ task.title }}</a>
                    </td>
                    <td>
                        <div class="form-group">
                            <select name="owner" class="form-control input-sm" ng-model="task.owner" ng-options="user.email as user.name for user in users" ng-select-value-change="updateTask($field, $value, story.id, $index, $event)" ng-disabled="iteration.closed">
                                <option value=""></option>
                            </select>
                        </div>
                    </td>
                    <td>
                        <div class="form-group">
                            <select name="status" class="form-control input-sm" ng-model="task.status" ng-options="id*1 as name for (id, name) in tasksStatuses" ng-select-value-change="updateTask($field, $value, story.id, $index, $event)" ng-change="updateStoryStatus(story)" ng-disabled="iteration.closed"></select>
                        </div>
                    </td>
                    <td>{{ task.estimate }} h</td>
                    <td>
                        <div class="form-group">
                            <input name="effort" type="number" class="form-control input-sm" ng-model="task.effort" ng-min="0" min="0" ng-value-change="updateTask($field, $value, story.id, $index, $event)" ng-change="updateEffort(story);" required ng-readonly="iteration.closed" /> h
                        </div>
                    </td>
                </tr>
                <tr class="task" data-story="{{ story.id }}">
                    <td class="add-task" colspan="8">
                        <button type="button" class="add btn btn-info btn-xs" data-toggle="modal" data-target="#new-task-modal" ng-click="setStory(story)" ng-disabled="iteration.closed">Add task</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </form>

    <div class="modal fade" id="new-task-modal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
        <div class="modal-dialog">
            <div class="modal-content">
                <form role="form" class="form-horizontal" name="newTaskForm" novalidate ng-submit="newTaskForm.$valid && !iteration.closed && saveTask()">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">New task</h4>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="taskTitle" class="col-sm-2 control-label">Title</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="taskTitle" ng-model="task.title" required ng-readonly="iteration.closed">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="taskEstimate" class="col-sm-2 control-label">Estimate</label>
                            <div class="col-xs-3">
                                <input type="number" min="1" class="form-control" id="taskEstimate" ng-model="task.estimate" required ng-readonly="iteration.closed">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="taskOwner" class="col-sm-2 control-label">Owner</label>
                            <div class="col-sm-10">
                                <select class="form-control" id="taskOwner" ng-model="task.owner" ng-options="user.email as user.name for user in users" ng-disabled="iteration.closed">
                                    <option value=""></option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="taskStatus" class="col-sm-2 control-label">Status</label>
                            <div class="col-sm-10">
                                <select class="form-control" id="taskStatus" ng-model="task.status" ng-options="id*1 as name for (id, name) in tasksStatuses" ng-disabled="iteration.closed"></select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="taskDetails" class="col-sm-2 control-label">Details</label>
                            <div class="col-sm-10">
                                <textarea class="form-control" rows="3" id="taskDetails" ng-model="task.details" ng-readonly="iteration.closed"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary" ng-disabled="newTaskForm.$invalid || iteration.closed">Add</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div ng-include src="'views/partial/edit-modal.tpl'"></div>
</div>