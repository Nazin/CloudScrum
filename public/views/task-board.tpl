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

<div id="task-board">
    <div class="row">
        <div class="status col-xs-2">
            <h4>Stories</h4>
        </div>
        <div class="status col-xs-2" ng-repeat="status in tasksStatuses">
            <h4>{{ status === '' ? '&nbsp;' : status }}</h4>
        </div>
    </div>
    <div class="row" ng-repeat="story in iteration.stories">
        <div class="status col-xs-2">
            <div class="tasks">
                <div class="story well well-sm">
                    <span class="badge">{{ story.estimate }}</span>
                    {{ story.title }}
                </div>
            </div>
        </div>
        <div class="status col-xs-2" ng-repeat="status in tasksStatuses">
            <div ui-sortable="sortableOptions[story.id]" class="tasks tasks_{{ story.id }}" ng-model="story.tasksByStatus[$index]" data-status="{{ $index }}">
                <div class="task well well-sm" ng-repeat="task in story.tasksByStatus[$index]" data-story-index="{{ $parent.$parent.$index }}" data-story="{{ story.id }}" data-task="{{ task.id }}">
                    {{ task.title }}
                    <span class="owner">{{ users[task.owner] }}</span>
                </div>
            </div>
        </div>
    </div>
</div>