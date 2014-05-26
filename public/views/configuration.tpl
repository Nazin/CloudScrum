<div id="configuration">

    <h3>Stories statuses</h3>

    <form role="form" name="storiesStatusesForm">
        <div class="form-group" ng-repeat="status in storiesStatuses track by $index">
            <div class="row">
                <div class="col-xs-10">
                    <input type="text" ng-model="storiesStatuses[$index]" class="form-control" ng-value-change="save('storiesStatuses')" placeholder="{{ $first ? 'Default story status' : ( $last ? 'Accepted story status' : 'Story status') }}">
                </div>
                <div class="col-xs-2" ng-if="!$first && !$last">
                    <span class="glyphicon glyphicon-remove" ng-click="removeStoriesStatus($index)"></span>
                </div>
            </div>
        </div>
        <button type="submit" class="btn btn-primary" ng-click="addStoriesStatus()">
            <span class="glyphicon glyphicon-plus"></span> Add
        </button>
    </form>

    <h3>Tasks statuses</h3>

    <form role="form" name="tasksStatusesForm">
        <div class="form-group" ng-repeat="status in tasksStatuses track by $index">
            <div class="row">
                <div class="col-xs-10">
                    <input type="text" ng-model="tasksStatuses[$index]" class="form-control" ng-value-change="save('tasksStatuses')" placeholder="{{ $first ? 'Default task status' : ( $last ? 'Completed task status' : 'Task status') }}">
                </div>
                <div class="col-xs-2" ng-if="!$first && !$last">
                    <span class="glyphicon glyphicon-remove" ng-click="removeTasksStatus($index)"></span>
                </div>
            </div>
        </div>
        <button type="submit" class="btn btn-primary" ng-click="addTasksStatus()">
            <span class="glyphicon glyphicon-plus"></span> Add
        </button>
    </form>

    <h3>Closing stories</h3>

    <form role="form" name="updateStoryStatusOnAllTaskCompletionForm">
        <div class="form-group">
            <p>When all tasks are completed, story status should automatically update to:</p>
            <select class="form-control" ng-model="updateStoryStatusOnAllTaskCompletion" ng-change="saveUpdateStoryStatusOnAllTaskCompletion()">
                <option value="-1" ng-selected="-1 === updateStoryStatusOnAllTaskCompletion">Story status should not be updated</option>
                <option ng-repeat="status in storiesStatuses track by $index" value="{{ $index }}" ng-selected="$index === updateStoryStatusOnAllTaskCompletion">{{ status }}</option>
            </select>
        </div>
    </form>
</div>