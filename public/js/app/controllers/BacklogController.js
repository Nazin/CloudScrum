'use strict';

cloudScrum.controller('BacklogController', function BacklogController($rootScope) {

    $rootScope.loading = false;
    $rootScope.selectProject();
});
