'use strict';

cloudScrum.controller('AuthController', function AuthController($scope, $rootScope, $location, $localStorage, Google) {

    Google.login().finally(function() {
        $rootScope.loading = false;
    });

    $scope.authorize = function() {

        Google.handleAuthClick().then(function() {

            $rootScope.authorized = true;
            $rootScope.loading = true;

            Google.findCompaniesFiles().then(function(files) {

                if (files.length === 0) {
                    $rootScope.newCompanyModal.modal('show');
                } else {

                    for (var i=0; i<files.length; i++) {
                        $rootScope.companies.push({id: files[i].id, name: files[i].title.replace('CloudScrum-', '')});
                    }

                    if (files.length === 1) {
                        $localStorage.cloudScrumCompanyFileId = files[0].id;
                        $location.path('/projects');
                    } else {
                        alert('todo! more than 1 company detected!'); //TODO
                    }
                }
            }, function(error) {
                alert('handle error: ' + error); //TODO
            }).finally(function() {
                $rootScope.loading = false;
            });
        });
    };
});