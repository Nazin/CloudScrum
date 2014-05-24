<div ng-controller="IterationStatusController">

    <form role="form" class="form-inline" id="release-iteration-breadcrumb" novalidate>
        <div class="form-group">
            <select class="form-control input-sm" ng-model="release" ng-options="name as name for (name, release) in releases" ng-change="changeRelease()" title="Change release"></select>
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
                        <select class="form-control input-sm" ng-model="story.owner" ng-options="user.email as user.name for user in users" ng-change="edit()" ng-disabled="iteration.closed">
                            <option value=""></option>
                        </select>
                    </div>
                </td>
                <td>
                    <div class="form-group">
                        <select class="form-control input-sm" ng-model="story.status" ng-options="id*1 as name for (id, name) in storiesStatuses" ng-change="edit();updateStoryPoints();" ng-disabled="iteration.closed"></select>
                    </div>
                </td>
                <td>{{ story.estimate }} SP</td>
                <td>{{ story.effort ? story.effort : 0 }} h</td>
            </tr>
            <tr class="task" ng-repeat="task in story.tasks">
                <td colspan="3"></td>
                <td ng-bs-popover>
                    <a href="" ng-click="setStory(story);showTaskDetails(task)" class="popover-toggle" data-container="body" data-trigger="hover" data-placement="bottom" data-content="{{ task.details ? task.details : ' ' }}">{{ task.title }}</a>
                </td>
                <td>
                    <div class="form-group">
                        <select class="form-control input-sm" ng-model="task.owner" ng-options="user.emailAddress as user.name for user in users" ng-change="edit()" ng-disabled="iteration.closed">
                            <option value=""></option>
                        </select>
                    </div>
                </td>
                <td>
                    <div class="form-group">
                        <select class="form-control input-sm" ng-model="task.status" ng-options="id*1 as name for (id, name) in tasksStatuses" ng-change="edit()" ng-disabled="iteration.closed"></select>
                    </div>
                </td>
                <td>{{ task.estimate }} h</td>
                <td>
                    <div class="form-group">
                        <input type="number" class="form-control input-sm" ng-model="task.effort" ng-min="0" min="0" ng-change="updateEffort(story);edit();" required ng-readonly="iteration.closed" /> h
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