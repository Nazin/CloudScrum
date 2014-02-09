'use strict';

cloudScrum.controller('DashboardController', function DashboardController($scope, $rootScope, Google, Flow) {
    Google.login().then(function() {
        Flow.on(function() {
            $rootScope.loading = false;
        });
    });
});