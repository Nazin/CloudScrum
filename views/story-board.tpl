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