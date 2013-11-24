<p ng-hide="authorized">
    You have to authorize the application using Google Account to proceed.
</p>
<p ng-show="authorized">
    You have already authorized the application with Google Account.
</p>
<p class="clearfix" ng-hide="authorized">
    <button type="button" class="btn btn-info" ng-click="authorize()">Authorize</button>
</p>