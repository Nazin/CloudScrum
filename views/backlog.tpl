<p class="clearfix">
    <button type="button" class="btn btn-info pull-right" ng-click="planRelease()">Plan release</button>
</p>

<div class="backlog-stories" ng-class="{ active: planning }">
    <div class="panel-group" id="accordion" ui-sortable="sortableOptions" ng-model="stories">
        <div class="panel panel-default backlog-story" ng-repeat="story in stories" ng-class="{ disabled: planning&&!story.ruler, ruler: story.ruler }">
            <div class="ruler" ng-if="story.ruler">
                <div class="iteration badge badge-success">Iteration {{story.iteration}}</div>
                <div class="points badge badge-success">{{story.points}}</div>
            </div>
            <div class="panel-heading" ng-if="!story.ruler">
                <span class="badge">{{story.estimate}}</span>
                <h4 class="panel-title">
                    <a data-toggle="collapse" data-parent="#accordion" href="#story_{{$index}}">
                        {{story.title}}
                    </a>
                </h4>
            </div>
            <div id="story_{{$index}}" class="panel-collapse collapse" ng-if="!story.ruler">
                <div class="panel-body">
                    Formularz do edycji? {{story.description}}
                </div>
            </div>
        </div>
    </div>
</div>