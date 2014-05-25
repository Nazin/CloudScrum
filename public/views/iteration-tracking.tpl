<div ng-controller="IterationStatusController">

    <form role="form" class="form-inline" id="release-iteration-breadcrumb" novalidate>
        <div class="form-group">
            <select class="form-control input-sm" ng-model="release" ng-options="name as name + (release.closed ? ' (Closed)' : '') for (name, release) in releases" ng-change="changeRelease()" title="Change release"></select>
        </div>
        <div class="form-group">
            <select class="form-control input-sm" ng-model="iteration" ng-options="id*1 as name for (id, name) in iterations" ng-change="changeIteration()" title="Change iteration"></select>
        </div>
    </form>

    <div class="row" id="iteration-status">
        <div class="col-sm-6 row">
            <div class="col-xs-6 right">
                <b>Start date</b>:<br />
                <b>End date</b>:
            </div>
            <div class="col-xs-6">
                {{ iterationData.startDate }}<br />
                {{ iterationData.endDate }}
            </div>
        </div>
        <div class="col-sm-6">
            <div class="row">
                <div class="col-xs-6 right">
                    <b>Estimated</b>:<br/>
                    <b>Accepted</b>:
                </div>
                <div class="col-xs-6">
                    {{ storyPointsEstimated }}<br/>
                    {{ storyPointsAccepted }}
                </div>
            </div>
            <div class="progress">
                <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="{{ percentageCompleted }}" aria-valuemin="0" aria-valuemax="100" style="width: {{ percentageCompleted }}%">
                    <span class="sr-only"></span>
                </div>
            </div>
        </div>
    </div>
</div>

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
            <form role="form" class="form-horizontal" name="newTaskForm" novalidate>
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
                    <button type="submit" class="btn btn-primary" ng-disabled="newTaskForm.$invalid || iteration.closed" ng-click="saveTask()">Add</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="edit-modal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
    <div class="modal-dialog">
        <div class="modal-content">
            <form role="form" class="form-horizontal" name="editForm" novalidate>
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-disabled="editForm.$invalid">&times;</button>
                    <h4 class="modal-title">{{ editItemStory ? 'Story' : 'Task' }} details</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="editItemTitle" class="col-sm-2 control-label">Title</label>
                        <div class="col-sm-10">
                            <input name="title" type="text" class="form-control" id="editItemTitle" ng-model="editItem.title" ng-value-change="updateEditElement($field, $value, $event)" required ng-readonly="iteration.closed">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editItemEstimate" class="col-sm-2 control-label">Estimate</label>
                        <div class="col-xs-3">
                            <input name="estimate" type="number" ng-min="1" min="1" class="form-control" id="editItemEstimate" ng-model="editItem.estimate" ng-value-change="updateEditElement($field, $value, $event)" ng-change="updateIterationStatus(editItemStory);" required ng-readonly="iteration.closed">
                        </div>
                    </div>
                    <div class="form-group" ng-if="!editItemStory">
                        <label for="editItemEffort" class="col-sm-2 control-label">Effort</label>
                        <div class="col-xs-3">
                            <input name="effort" type="number" ng-min="0" min="0" class="form-control" id="editItemEffort" ng-model="editItem.effort" ng-value-change="updateEditElement($field, $value, $event)" ng-change="updateEffort(activeStory);" required ng-readonly="iteration.closed">
                        </div>
                    </div>
                    <div class="form-group" ng-if="editItemStory">
                        <label for="editItemEpic" class="col-sm-2 control-label">Epic</label>
                        <div class="col-sm-10">
                            <input name="epic" type="text" class="form-control" id="editItemEpic" ng-model="editItem.epic" ng-value-change="updateEditElement($field, $value, $event)" ng-readonly="iteration.closed">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editItemOwner" class="col-sm-2 control-label">Owner</label>
                        <div class="col-sm-10">
                            <select name="owner" class="form-control" id="editItemOwner" ng-model="editItem.owner" ng-select-value-change="updateEditElement($field, $value, $event)" ng-options="user.email as user.name for user in users" ng-disabled="iteration.closed">
                                <option value=""></option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editItemStatus" class="col-sm-2 control-label">Status</label>
                        <div class="col-sm-10">
                            <select name="status" class="form-control" id="editItemStatus" ng-model="editItem.status" ng-select-value-change="updateEditElement($field, $value, $event)" ng-change="updateIterationStatus(editItemStory);updateStoryStatus(activeStory, !editItemStory);" ng-options="id*1 as name for (id, name) in editItemStatuses" ng-disabled="iteration.closed"></select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editItemDetails" class="col-sm-2 control-label">Details</label>
                        <div class="col-sm-10">
                            <textarea name="details" class="form-control" rows="3" id="editItemDetails" ng-model="editItem.details" ng-value-change="updateEditElement($field, $value, $event)" ng-readonly="iteration.closed"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" ng-disabled="editForm.$invalid" data-dismiss="modal">Close</button>
                </div>
            </form>
        </div>
    </div>
</div>