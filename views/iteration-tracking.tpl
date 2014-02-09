<p class="clearfix buttons-nav">
    <button type="button" class="btn btn-info pull-right" ng-click="saveRelease()" ng-show="unsaved" ng-disabled="editIterationForm.$invalid">Save</button>
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
        <tbody>
            <tr ng-repeat-start="story in stories" ng-bs-popover>
                <td><span ng-if="story.tasks.length!==0" ng-click="toggleTasks($event, story.id)">+</span></td>
                <td>{{story.id}}</td>
                <td>{{story.epic}}</td>
                <td>
                    <a href="" ng-click="showStoryDetails(story)" class="popover-toggle" data-container="body" data-trigger="hover" data-placement="bottom" data-content="{{story.details}}">{{story.title}}</a>
                </td>
                <td>
                    <div class="form-group">
                        <select class="form-control input-sm" ng-model="story.owner" ng-options="user.emailAddress as user.name for user in users" ng-change="edit()">
                            <option value=""></option>
                        </select>
                    </div>
                </td>
                <td>
                    <div class="form-group">
                        <select class="form-control input-sm" ng-model="story.status" ng-options="status for status in storiesStatusesInfo" ng-change="edit()"></select>
                    </div>
                </td>
                <td>{{story.estimate}} SP</td>
                <td>{{story.effort}} h</td>
            </tr>
            <tr class="task" data-story="{{story.id}}" ng-repeat="task in story.tasks" ng-repeat-end ng-bs-popover>
                <td colspan="3"></td>
                <td>
                    <a href="" ng-click="showTaskDetails(task)" class="popover-toggle" data-container="body" data-trigger="hover" data-placement="bottom" data-content="{{task.details}}">{{task.title}}</a>
                </td>
                <td>
                    <div class="form-group">
                        <select class="form-control input-sm" ng-model="task.owner" ng-options="user.emailAddress as user.name for user in users" ng-change="edit()">
                            <option value=""></option>
                        </select>
                    </div>
                </td>
                <td>
                    <div class="form-group">
                        <select class="form-control input-sm" ng-model="task.status" ng-options="status for status in tasksStatusesInfo" ng-change="edit()"></select>
                    </div>
                </td>
                <td>{{task.estimate}} h</td>
                <td>
                    <div class="form-group">
                        <input type="number" class="form-control input-sm" ng-model="task.effort" ng-min="0" min="0" ng-change="updateEffort(story)" /> h
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</form>