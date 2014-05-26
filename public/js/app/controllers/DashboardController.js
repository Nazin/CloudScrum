'use strict';

cloudScrum.controller('DashboardController', function DashboardController($rootScope, $scope) {

    $scope.releaseData = true;
    $rootScope.selectProject();

    $scope.loadIterationCallback = function(iteration, release) {
        $rootScope.loading = false;
    };
});
