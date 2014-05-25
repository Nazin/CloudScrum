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