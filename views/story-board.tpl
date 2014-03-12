<div ng-controller="IterationStatusController">
    <form role="form" class="form-inline" id="release-iteration-breadcrumb" novalidate>
        <div class="form-group">
            <select class="form-control input-sm" ng-model="release" ng-options="release.name for (id, release) in releases" ng-change="changeRelease(this)" title="Change release"></select>
        </div>
        <div class="form-group">
            <select class="form-control input-sm" ng-model="iteration" ng-options="iteration.name for iteration in iterations" ng-change="updateStoryPoints()" title="Change iteration"></select>
        </div>
    </form>

    <div class="row" id="iteration-status">
        <div class="col-sm-6 row">
            <div class="col-xs-6 right">
                <b>Start date</b>:<br />
                <b>End date</b>:
            </div>
            <div class="col-xs-6">
                {{iteration.startDate}}<br />
                {{iteration.endDate}}
            </div>
        </div>
        <div class="col-sm-6">
            <div class="row">
                <div class="col-xs-6 right">
                    <b>Estimated</b>:<br/>
                    <b>Accepted</b>:
                </div>
                <div class="col-xs-6">
                    {{storyPointsEstimated}}<br/>
                    {{storyPointsAccepted}}
                </div>
            </div>
            <div class="progress">
                <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="{{percentCompleted}}" aria-valuemin="0" aria-valuemax="100" style="width: {{percentCompleted}}%">
                    <span class="sr-only"></span>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="story-board" class="row">
    <div class="status col-md-2 col-sm-4 col-xs-6" ng-repeat-start="stories in statuses">
        <h4>{{statusesInfo[$index]}}</h4>
        <div ui-sortable="sortableOptions" class="stories" ng-model="stories">
            <div class="story well well-sm" ng-repeat="story in stories">
                <span class="badge">{{story.owner}}</span>
                {{story.title}}
            </div>
        </div>
    </div>
    <div class="clearfix visible-xs" ng-if="$index%2==1"></div>
    <div class="clearfix visible-sm" ng-if="$index%3==2" ng-repeat-end></div>
</div>