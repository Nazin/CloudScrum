<p class="clearfix buttons-nav">
    <button type="button" class="btn btn-info pull-right" ng-click="saveStories()" ng-show="unsaved" ng-disabled="editStoryForm.$invalid">Save</button>
    <button type="button" class="btn pull-right" ng-click="sortable = !sortable" ng-show="stories.length !== 0 && !planning" ng-class="{ 'btn-info': !sortable, 'btn-success': sortable }">Sort</button>
    <button type="button" class="btn btn-info pull-right" data-toggle="modal" data-target="#new-story-modal" ng-show="!planning">Add new</button>
    <button type="button" class="btn btn-info pull-right" ng-disabled="unsaved||sortable" ng-click="planRelease()" ng-show="stories.length !== 0 && !planning">Plan release</button>

    <button type="button" class="btn btn-danger pull-right" ng-show="planning" ng-click="cancelPlanning()">Cancel</button>
    <button type="button" class="btn btn-warning pull-right" ng-show="planning" ng-disabled="iterations==1" ng-click="removeLastIteration()">Remove iteration</button>
    <button type="button" class="btn btn-info pull-right" ng-show="planning" ng-click="addIteration()">Add iteration</button>
    <button type="button" class="btn btn-info pull-right" data-toggle="modal" data-target="#new-release-modal" ng-show="planning">Save release</button>
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
                                <input type="text" class="form-control" ng-model="story.title" ng-change="edit()" ng-readonly="planning" required />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Estimate</label>
                            <div class="col-xs-3">
                                <input type="number" min="1" class="form-control" ng-model="story.estimate" ng-change="edit()" ng-readonly="planning" required />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Epic</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" ng-model="story.epic" ng-change="edit()" ng-readonly="planning" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Details</label>
                            <div class="col-sm-10">
                                <textarea class="form-control" rows="3" ng-model="story.details" ng-change="edit()" ng-readonly="planning"></textarea>
                            </div>
                        </div>
                        <fieldset class="tasks">
                            <legend>Tasks</legend>
                            <button type="button" class="add btn btn-info btn-xs" ng-show="!planning" data-toggle="modal" data-target="#new-task-modal" ng-click="setStory(story)">Add task</button>
                            <div class="no-tasks" ng-show="story.tasks.length===0">
                                <p class="text-warning">There are no tasks defined for this story.</p>
                            </div>
                            <div class="task" ng-repeat="task in story.tasks">
                                <div class="form-group">
                                    <div class="col-sm-8">
                                        <input type="text" class="form-control" ng-model="task.title" ng-change="edit()" ng-readonly="planning" placeholder="Title" required />
                                    </div>
                                    <div class="col-sm-3 col-sm-offset-1">
                                        <input type="number" min="1" class="form-control" ng-model="task.estimate" ng-change="edit()" ng-readonly="planning" placeholder="Estimate" required />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="col-sm-12">
                                        <textarea class="form-control" rows="2" ng-model="task.details" ng-change="edit()" ng-readonly="planning" placeholder="Details"></textarea>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
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

<div class="modal fade" id="new-task-modal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title">New task</h4>
            </div>
            <div class="modal-body">
                <form role="form" class="form-horizontal" name="newTaskForm" ng-submit="newTaskForm.$valid && createTask()" novalidate>
                    <div class="form-group">
                        <label for="taskTitle" class="col-sm-2 control-label">Title</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="taskTitle" ng-model="taskTitle" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="taskEstimate" class="col-sm-2 control-label">Estimate</label>
                        <div class="col-xs-3">
                            <input type="number" min="1" class="form-control" id="taskEstimate" ng-model="taskEstimate" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="taskDetails" class="col-sm-2 control-label">Details</label>
                        <div class="col-sm-10">
                            <textarea class="form-control" rows="3" id="taskDetails" ng-model="taskDetails"></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" ng-disabled="newTaskForm.$invalid" ng-click="createTask()">Add</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="new-release-modal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title">New release</h4>
            </div>
            <div class="modal-body">
                <form role="form" class="form-horizontal" name="newReleaseForm" ng-submit="newReleaseForm.$valid && createRelease()" novalidate>
                    <div class="form-group">
                        <label for="releaseName" class="col-sm-2 control-label">Name</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="releaseName" ng-model="releaseName" required />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="releaseStartDate" class="col-sm-2 control-label">Start date</label>
                        <div class="col-sm-10">
                            <input type="date" min="{{minReleaseStartDate}}" max="{{maxReleaseStartDate}}" class="form-control" id="releaseStartDate" ng-min="minReleaseStartDate" ng-max="maxReleaseStartDate" ng-model="releaseStartDate" required />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="iterationLength" class="col-sm-2 control-label">Iteration length</label>
                        <div class="col-xs-3">
                            <input type="number" min="1" class="form-control" id="iterationLength" ng-model="iterationLength" required />
                            <span class="help-block">Days</span>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" ng-disabled="newReleaseForm.$invalid" ng-click="createRelease()">Add</button>
            </div>
        </div>
    </div>
</div>