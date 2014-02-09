<table class="table" id="iteration-tracking">
    <thead>
        <tr>
            <th></th>
            <th>Id</th>
            <th>Epic</th>
            <th>Title</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Estimate</th>
            <th>Effort</th>
        </tr>
    </thead>
    <tbody>
        <tr ng-repeat-start="story in stories" ng-bs-popover>
            <td><span ng-if="story.tasks.length!==0" ng-click="toggleTasks($event, story.id)">+</span></td>
            <td>{{story.id}}</td>
            <td>{{story.epic}}</td>
            <td>
                <a href="" ng-click="showStoryDetails(story)" class="popover-toggle" data-container="body" data-trigger="hover" data-placement="bottom" data-content="{{story.details}}">{{story.title}}</a>
            </td>
            <td>{{story.owner}}</td>
            <td>{{story.status}}</td>
            <td>{{story.estimate}}</td>
            <td>{{story.effort}}</td>
        </tr>
        <tr class="task" data-story="{{story.id}}" ng-repeat="task in story.tasks" ng-repeat-end ng-bs-popover>
            <td colspan="3"></td>
            <td>
                <a href="" ng-click="showTaskDetails(task)" class="popover-toggle" data-container="body" data-trigger="hover" data-placement="bottom" data-content="{{task.details}}">{{task.title}}</a>
            </td>
            <td>{{task.owner}}</td>
            <td>{{task.status}}</td>
            <td>{{task.estimate}}</td>
            <td>{{task.effort}}</td>
        </tr>
    </tbody>
</table>