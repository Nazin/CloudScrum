<div ng-include src="'views/partial/iteration-status.tpl'"></div>

<div class="row">
    <div class="col-sm-6">
        <highchart config="burndownConfig"></highchart>
    </div>
    <div class="col-sm-6">
        <highchart config="tasksEffortEstimateChartConfig"></highchart>
    </div>
</div>

<div class="row">
    <div class="col-sm-12">
        <highchart config="usersEffortChartConfig"></highchart>
    </div>
</div>