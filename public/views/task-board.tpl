<div ng-controller="IterationUpdateController">

    <div ng-include src="'views/partial/iteration-status.tpl'"></div>

    <div id="task-board">
        <div class="row">
            <div class="status col-xs-2">
                <h4>Stories</h4>
            </div>
            <div class="status col-xs-2" ng-repeat="status in tasksStatuses">
                <h4>{{ status === '' ? '&nbsp;' : status }}</h4>
            </div>
        </div>
        <div class="row" ng-repeat="story in iteration.stories">
            <div class="status col-xs-2">
                <div class="tasks">
                    <div class="story well well-sm" ng-click="showStoryDetails(story)">
                        <span class="badge">{{ story.estimate }}</span>
                        {{ story.title }}
                    </div>
                </div>
            </div>
            <div class="status col-xs-2" ng-repeat="status in tasksStatuses">
                <div ui-sortable="sortableOptions[story.id]" class="tasks tasks_{{ story.id }}" ng-model="story.tasksByStatus[$index]" data-status="{{ $index }}">
                    <div class="task well well-sm" ng-click="setStory(story);showTaskDetails(task, task.id);" ng-class="{ disabled: iteration.closed }" ng-repeat="task in story.tasksByStatus[$index]" data-story-index="{{ $parent.$parent.$index }}" data-story="{{ story.id }}" data-task="{{ task.id }}">
                        {{ task.title }}
                        <span class="owner">{{ usersMapping[task.owner] }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div ng-include src="'views/partial/edit-modal.tpl'"></div>
</div>