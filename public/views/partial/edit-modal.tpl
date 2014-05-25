<div class="modal fade" id="edit-modal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
    <div class="modal-dialog">
        <div class="modal-content">
            <form role="form" class="form-horizontal" name="editForm" novalidate>
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-disabled="editForm.$invalid">&times;</button>
                    <h4 class="modal-title">{{ editItemStory ? 'Story' : 'Task' }} details</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="editItemTitle" class="col-sm-2 control-label">Title</label>
                        <div class="col-sm-10">
                            <input name="title" type="text" class="form-control" id="editItemTitle" ng-model="editItem.title" ng-value-change="updateEditElement($field, $value, $event, editForm.$valid)" required ng-readonly="iteration.closed">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editItemEstimate" class="col-sm-2 control-label">Estimate</label>
                        <div class="col-xs-3">
                            <input name="estimate" type="number" ng-min="1" min="1" class="form-control" id="editItemEstimate" ng-model="editItem.estimate" ng-value-change="updateEditElement($field, $value, $event, editForm.$valid)" ng-change="updateIterationStatus(editItemStory);" required ng-readonly="iteration.closed">
                        </div>
                    </div>
                    <div class="form-group" ng-if="!editItemStory">
                        <label for="editItemEffort" class="col-sm-2 control-label">Effort</label>
                        <div class="col-xs-3">
                            <input name="effort" type="number" ng-min="0" min="0" class="form-control" id="editItemEffort" ng-model="editItem.effort" ng-value-change="updateEditElement($field, $value, $event, editForm.$valid)" ng-change="updateEffort(activeStory);" required ng-readonly="iteration.closed">
                        </div>
                    </div>
                    <div class="form-group" ng-if="editItemStory">
                        <label for="editItemEpic" class="col-sm-2 control-label">Epic</label>
                        <div class="col-sm-10">
                            <input name="epic" type="text" class="form-control" id="editItemEpic" ng-model="editItem.epic" ng-value-change="updateEditElement($field, $value, $event, editForm.$valid)" ng-readonly="iteration.closed">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editItemOwner" class="col-sm-2 control-label">Owner</label>
                        <div class="col-sm-10">
                            <select name="owner" class="form-control" id="editItemOwner" ng-model="editItem.owner" ng-select-value-change="updateEditElement($field, $value, $event, editForm.$valid)" ng-options="user.email as user.name for user in users" ng-disabled="iteration.closed">
                                <option value=""></option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group" ng-if="(!editItemStory && !hideTaskStatusInEditModal) || editItemStory">
                        <label for="editItemStatus" class="col-sm-2 control-label">Status</label>
                        <div class="col-sm-10">
                            <select name="status" class="form-control" id="editItemStatus" ng-model="editItem.status" ng-select-value-change="updateEditElement($field, $value, $event, editForm.$valid)" ng-change="updateIterationStatus(editItemStory);updateStoryStatus(activeStory, !editItemStory);" ng-options="id*1 as name for (id, name) in editItemStatuses" ng-disabled="iteration.closed"></select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editItemDetails" class="col-sm-2 control-label">Details</label>
                        <div class="col-sm-10">
                            <textarea name="details" class="form-control" rows="3" id="editItemDetails" ng-model="editItem.details" ng-value-change="updateEditElement($field, $value, $event, editForm.$valid)" ng-readonly="iteration.closed"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" ng-disabled="editForm.$invalid" data-dismiss="modal">Close</button>
                </div>
            </form>
        </div>
    </div>
</div>