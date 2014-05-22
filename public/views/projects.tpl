<p class="clearfix">
    <button type="button" class="btn btn-info pull-right" data-toggle="modal" data-target="#new-project-modal" data-keyboard="true">Add new</button>
</p>

<div class="list-group">
    <a ng-repeat="project in projects" href="" class="list-group-item" ng-class="{ active: activeProject === $index }" ng-click="loadProject($index)">
        <h4 class="list-group-item-heading">{{ project.name }}</h4>
        <p class="list-group-item-text">{{ project.path }}</p>
    </a>
</div>