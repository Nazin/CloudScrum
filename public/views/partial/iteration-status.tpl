<div ng-controller="IterationStatusController">

    <form role="form" class="form-inline" id="release-iteration-breadcrumb" novalidate>
        <div class="form-group">
            <select class="form-control input-sm" ng-model="release" ng-options="name as name + (release.closed ? ' (Closed)' : '') for (name, release) in releases" ng-change="changeRelease()" title="Change release"></select>
        </div>
        <div class="form-group" ng-hide="releaseData">
            <select class="form-control input-sm" ng-model="iteration" ng-options="id*1 as name for (id, name) in iterations" ng-change="changeIteration()" title="Change iteration"></select>
        </div>
    </form>

    <div class="row" id="iteration-status">
        <div class="col-sm-6 row">
            <div class="col-xs-6 right">
                <b>Start date</b>:<br />
                <b>End date</b>:
                <span ng-if="releaseData"><br /><b>Active iteration</b>:</span>
            </div>
            <div class="col-xs-6">
                {{ releaseData ? releases[release].startDate : iterationData.startDate }}<br />
                {{ releaseData ? releases[release].endDate : iterationData.endDate }}
                <span ng-if="releaseData && !releases[release].closed"><br />{{ releases[release].activeIteration }}</span>
                <span ng-if="releaseData && releases[release].closed"><br />Release closed</span>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="row">
                <div class="col-xs-6 right">
                    <b>Estimated</b>:<br/>
                    <b>Accepted</b>:
                </div>
                <div class="col-xs-6">
                    {{ releaseData ? releases[release].totalEstimated : storyPointsEstimated }}<br/>
                    {{ releaseData ? releases[release].totalAccepted : storyPointsAccepted }}
                </div>
            </div>
            <div class="progress">
                <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="{{ releaseData ? releasepercentageCompleted : percentageCompleted }}" aria-valuemin="0" aria-valuemax="100" style="width: {{ releaseData ? releasepercentageCompleted : percentageCompleted }}%">
                    <span class="sr-only"></span>
                </div>
            </div>
        </div>
    </div>
</div>