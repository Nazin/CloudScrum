<p class="clearfix buttons-nav">
    <button type="button" class="btn btn-info pull-right" data-toggle="modal" data-target="#new-story-modal">Add new</button>
</p>

<div class="backlog-stories" ng-class="{ active: planning }">
    <form role="form" class="form-horizontal" novalidate name="editStoryForm">
        <div class="panel-group" id="accordion" ui-sortable="sortableOptions" ng-model="stories">
            <div class="panel panel-default backlog-story" ng-repeat="story in stories" ng-class="{ disabled: (planning&&!story.ruler)||(!sortable&&!story.ruler), ruler: story.ruler }">
                <div class="ruler" ng-if="story.ruler">
                    <div class="iteration badge badge-success">Iteration {{ story.iteration }}</div>
                    <div class="points badge badge-success">{{ story.points }}</div>
                </div>
                <div class="panel-heading" ng-if="!story.ruler">
                    <span class="badge">{{ story.estimate }}</span>
                    <h4 class="panel-title">
                        <a data-toggle="collapse" data-parent="#accordion" data-target="#story_{{ $index }}" href="">
                            {{ story.title }}
                        </a>
                    </h4>
                </div>
                <div id="story_{{ $index }}" class="panel-collapse collapse" ng-if="!story.ruler">
                    <div class="panel-body">
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Title</label>
                            <div class="col-sm-10">
                                <input name="title" type="text" class="form-control" ng-model="story.title" ng-value-change="updateStory($field, $value, story.id, $event)" ng-readonly="planning" required />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Estimate</label>
                            <div class="col-xs-3">
                                <input name="estimate" type="number" min="1" class="form-control" ng-model="story.estimate" ng-value-change="updateStory($field, $value, story.id, $event)" ng-readonly="planning" required />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Epic</label>
                            <div class="col-sm-10">
                                <input name="epic" type="text" class="form-control" ng-model="story.epic" ng-value-change="updateStory($field, $value, story.id, $event)" ng-readonly="planning" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Details</label>
                            <div class="col-sm-10">
                                <textarea name="details" class="form-control" rows="3" ng-model="story.details" ng-value-change="updateStory($field, $value, story.id, $event)" ng-readonly="planning"></textarea>
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
            <form role="form" class="form-horizontal" name="newStoryForm" novalidate>
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">New story</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="storyTitle" class="col-sm-2 control-label">Title</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="storyTitle" ng-model="story.title" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="storyEstimate" class="col-sm-2 control-label">Estimate</label>
                        <div class="col-xs-3">
                            <input type="number" min="1" class="form-control" id="storyEstimate" ng-model="story.estimate" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="storyEpic" class="col-sm-2 control-label">Epic</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="storyEpic" ng-model="story.epic">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="storyDetails" class="col-sm-2 control-label">Details</label>
                        <div class="col-sm-10">
                            <textarea class="form-control" rows="3" id="storyDetails" ng-model="story.details"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" ng-disabled="newStoryForm.$invalid" ng-click="saveStory()">Add</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="new-task-modal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
    <div class="modal-dialog">
        <div class="modal-content">
            <form role="form" class="form-horizontal" name="newTaskForm" novalidate>
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">New task</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="taskTitle" class="col-sm-2 control-label">Title</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="taskTitle" ng-model="task.title" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="taskEstimate" class="col-sm-2 control-label">Estimate</label>
                        <div class="col-xs-3">
                            <input type="number" min="1" class="form-control" id="taskEstimate" ng-model="task.estimate" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="taskDetails" class="col-sm-2 control-label">Details</label>
                        <div class="col-sm-10">
                            <textarea class="form-control" rows="3" id="taskDetails" ng-model="task.details"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" ng-disabled="newTaskForm.$invalid" ng-click="saveTask()">Add</button>
                </div>
            </form>
        </div>
    </div>
</div>