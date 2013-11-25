<p class="clearfix buttons-nav">
    <button type="button" class="btn btn-info pull-right" ng-click="saveStories()" ng-show="unsaved" ng-disabled="editStoryForm.$invalid">Save</button>
    <button type="button" class="btn pull-right" ng-click="sortable =! sortable" ng-show="stories.length !== 0" ng-class="{ 'btn-info': !sortable, 'btn-success': sortable }">Sort</button>
    <button type="button" class="btn btn-info pull-right" data-toggle="modal" data-target="#new-story-modal">Add new</button>
    <button type="button" class="btn pull-right" ng-click="planRelease()" ng-show="stories.length !== 0" ng-class="{ 'btn-info': !planning, 'btn-success': planning }">Plan release</button>
</p>

<div class="backlog-stories" ng-class="{ active: planning }">
    <form role="form" class="form-horizontal" novalidate name="editStoryForm">
        <div class="panel-group" id="accordion" ui-sortable="sortableOptions" ng-model="stories">
            <div class="panel panel-default backlog-story" ng-repeat="story in stories" ng-class="{ disabled: (planning&&!story.ruler)||(!sortable&&!story.ruler), ruler: story.ruler }">
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
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Title</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" ng-model="story.title" ng-change="edit()" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Estimate</label>
                            <div class="col-xs-3">
                                <input type="number" min="1" class="form-control" ng-model="story.estimate" ng-change="edit()" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Epic</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" ng-model="story.epic" ng-change="edit()">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Details</label>
                            <div class="col-sm-10">
                                <textarea class="form-control" rows="3" ng-model="story.details" ng-change="edit()"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>

<div class="modal fade" id="new-story-modal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title">New story</h4>
            </div>
            <div class="modal-body">
                <form role="form" class="form-horizontal" name="newStoryForm" ng-submit="newStoryForm.$valid && createStory()" novalidate>
                    <div class="form-group">
                        <label for="storyTitle" class="col-sm-2 control-label">Title</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="storyTitle" ng-model="storyTitle" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="storyEstimate" class="col-sm-2 control-label">Estimate</label>
                        <div class="col-xs-3">
                            <input type="number" min="1" class="form-control" id="storyEstimate" ng-model="storyEstimate" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="storyEpic" class="col-sm-2 control-label">Epic</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="storyEpic" ng-model="storyEpic">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="storyDetails" class="col-sm-2 control-label">Details</label>
                        <div class="col-sm-10">
                            <textarea class="form-control" rows="3" id="storyDetails" ng-model="storyDetails"></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" ng-disabled="newStoryForm.$invalid" ng-click="createStory()">Add</button>
            </div>
        </div>
    </div>
</div>