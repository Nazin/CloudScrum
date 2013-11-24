<p class="clearfix">
    <button type="button" class="btn btn-info pull-right" data-toggle="modal" data-target="#new-project-modal">Add new</button>
</p>

<div class="list-group">
    <a ng-repeat="project in projects" href="" class="list-group-item" ng-class="{ active: projectFileId === project.id }" ng-click="loadProject(project)">{{project.name}}</a>
</div>

<div class="modal fade" id="new-project-modal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-hide="projects.length===0">&times;</button>
                <h4 class="modal-title">New project</h4>
            </div>
            <div class="modal-body">
                <form role="form" class="form-horizontal" name="newProjectForm" ng-submit="newProjectForm.$valid && createProject()" novalidate>
                    <div class="form-group">
                        <label for="projectName" class="col-sm-2 control-label">Name</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="projectName" ng-model="projectName" ng-pattern="/^[a-zA-Z0-9_\-. ]+$/" required>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal" ng-hide="projects.length===0">Close</button>
                <button type="button" class="btn btn-primary" ng-disabled="newProjectForm.$invalid" ng-click="createProject()">Save</button>
            </div>
        </div>
    </div>
</div>