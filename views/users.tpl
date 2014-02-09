<table class="table table-striped" id="users-table">
    <thead>
        <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
        <tr ng-repeat="user in users">
            <td>{{user.name}}</td>
            <td>{{user.emailAddress}}</td>
            <td><a href="" ng-click="removeUser(user)" ng-if="user.role !== 'owner'">Remove</a></td>
        </tr>
        <tr>
            <td colspan="2">
                <form role="form" class="form-inline" name="newUserForm" ng-submit="newUserForm.$valid && addUser()" novalidate>
                    <div class="form-group">
                        <input type="email" class="form-control input-sm" ng-model="email" placeholder="Email" required />
                    </div>
                </form>
            </td>
            <td>
                <button type="button" class="add btn btn-info btn-sm" ng-disabled="newUserForm.$invalid" ng-click="addUser()">Add user</button>
            </td>
        </tr>
    </tbody>
</table>