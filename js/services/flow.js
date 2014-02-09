'use strict';

cloudScrum.service('Flow', function Flow($q, $localStorage, $rootScope, $timeout, $location, Google) {

    var flowFileId, companyId, companyName, projectId, releaseId, projects = {}, downloaded = false, self = this;

    companyId = $localStorage.cloudScrumCompanyFileId;
    companyName = $localStorage.cloudScrumCompanyName;
    projectId = $localStorage.cloudScrumProjectFileId;
    releaseId = $localStorage.cloudScrumReleaseFileId;

    self.getCompanyId = function() {
        return companyId;
    };

    self.getProjectId = function() {
        return projectId;
    };

    self.getProjectName = function() {
        return typeof projects[projectId] !== 'undefined' ? projects[projectId]['name'] : undefined;
    };

    self.getReleaseId = function() {

        if (typeof releaseId === 'undefined' && typeof projects[projectId] !== 'undefined') {

            var key, now = moment();

            for (key in projects[projectId]['releases']) {

                var start = moment(projects[projectId]['releases'][key]['startDate']), end = moment(projects[projectId]['releases'][key]['endDate']);

                if (now.isAfter(start) && now.isBefore(end)) {
                    self.setRelease(key);
                    break;
                }

                if (now.isBefore(end)) {
                    self.setRelease(key);
                }
            }

            if (typeof releaseId === 'undefined' && projects[projectId]['releases'].length !== 0) {
                self.setRelease(key);
            }
        }

        return releaseId;
    };

    self.getBacklogId = function() {
        return typeof projects[projectId] !== 'undefined' ? projects[projectId]['backlog'] : undefined;
    };

    self.setCompany = function(id, name, newCompany) {

        $localStorage.cloudScrumCompanyFileId = companyId = id;
        $localStorage.cloudScrumCompanyName = companyName = name;
        flowFileId = undefined;
        projects = {};
        downloaded = false;

        delete $localStorage.cloudScrumProjectFileId;
        delete $localStorage.cloudScrumReleaseFileId;

        if (!newCompany) {
            self.on(function(){}, true);
        }
    };

    self.setProject = function(id) {

        $localStorage.cloudScrumProjectFileId = projectId = id;

        delete $localStorage.cloudScrumReleaseFileId;
        releaseId = undefined;

        updateNamesOnRootScope();
    };

    self.setRelease = function(id) {
        $localStorage.cloudScrumReleaseFileId = releaseId = id;
    };

    self.newProject = function(id, name, backlogFileId, first) {
        return updateFlowFile(first, function() {
            projects[id] = {
                name: name,
                backlog: backlogFileId,
                releases: {}
            };
        }, function() {
            self.setProject(id);
        });
    };

    self.newRelease = function(id, name, iterations) {
        return updateFlowFile(false, function() {
            projects[projectId]['releases'][id] = {
                name: name,
                startDate: iterations[0].startDate,
                endDate: iterations[iterations.length-1].endDate
            };
        }, function() {
            self.setRelease(id);
        });
    };

    self.on = function(callback, force, omit) {
        force = force || false;
        omit = omit || false;
        if (downloaded && !force) {
            callback();
        } else {
            if (omit) {
                callback();
            } else {
                Google.getFlowFile(companyId).then(function(data) {
                    projects = data.projects;
                    flowFileId = data.flowFileId;
                    downloaded = true;
                    callback();
                    updateNamesOnRootScope();
                }, function(error) {
                    if (error === Google.MISSING_FLOW_FILE) {
                        $location.path('/projects');
                    } else {
                        alert('handle flow error: ' + error); //todo
                        $rootScope.loading = false;
                    }
                });
            }
        }
    };

    /**
     * Used to download flow file to update local variables
     *
     * @param omit
     * @param onUpdateCallback
     * @param onCompleteCallback
     * @returns {promise|*}
     */
    var updateFlowFile = function(omit, onUpdateCallback, onCompleteCallback) {

        var deferred = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, 10000);

        self.on(function() {

            onUpdateCallback();

            Google.updateFlowFile(flowFileId, companyId, projects).then(function(file) {
                onCompleteCallback();
                flowFileId = file.id;
                deferred.resolve(file);
            }, function(error) {
                deferred.reject(error);
            }).finally(function() {
                $timeout.cancel(timeoutPromise);
            });
        }, true, omit);

        return deferred.promise;
    };

    var updateNamesOnRootScope = function() {
        $rootScope.selectedCompanyName = companyName;
        $rootScope.selectedProjectName = self.getProjectName();
    };

    updateNamesOnRootScope();
});