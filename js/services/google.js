'use strict';

cloudScrum.service('Google', function Google($location, $rootScope, $q, $timeout) {

    var clientId = '641738097836.apps.googleusercontent.com',
        apiKey = 'AIzaSyBduR27RDdEu6gN5ggwi6JFdqANv_xFpLk',
        scopes = 'https://www.googleapis.com/auth/drive https://spreadsheets.google.com/feeds/',
        timeoutTime = 10000,
        isAuthorized = false,
        deferred = $q.defer(),
        deferred2,
        driveJSLoaded = false,
        self = this;

    self.ERROR_TIMEOUT = -1;

    self.isAuthorized = function() {
        return isAuthorized;
    };

    self.login = function() {
        return deferred.promise;
    };

    /**
     * Tries to authorize on google api script loaded
     */
    self.handleClientLoad = function() {
        gapi.client.setApiKey(apiKey);
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, self.handleAuthResult);
    };

    /**
     * Tries to authorize on button click
     *
     * @returns {promise|*|Function}
     */
    self.handleAuthClick = function() {

        deferred2 = $q.defer();
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, self.handleAuthResult);

        return deferred2.promise;
    };

    /**
     * Handles result of authorization try
     *
     * @param authResult
     */
    self.handleAuthResult = function(authResult) {

        if (authResult && !authResult.error) {

            isAuthorized = true;
            deferred.resolve();

            if (typeof deferred2 !== 'undefined') {
                deferred2.resolve();
            }
        } else {

            isAuthorized = false;
            deferred.reject();

            if (typeof deferred2 !== 'undefined') {
                deferred2.reject();
            }
        }

        $rootScope.$apply();
    };

    self.onDrive = function(callback) {
        if (driveJSLoaded) {
            callback();
        } else {
            gapi.client.load('drive', 'v2', function() {
                driveJSLoaded = true;
                callback();
            });
        }
    };

    self.findCompaniesFiles = function() {
        return findFiles('title contains \'CloudScrum-\' and \'root\' in parents and trashed = false and mimeType = \'application/vnd.google-apps.folder\'');
    };

    self.findProjectsFiles = function(parent) {
        return findFiles('\'' + parent + '\' in parents and trashed = false and mimeType = \'application/vnd.google-apps.folder\'');
    };

    self.findBacklog = function(parent) {
        return findFiles('title = \'backlog\' and \'' + parent + '\' in parents and trashed = false and mimeType = \'application/vnd.google-apps.spreadsheet\'');
    };

    self.createFolder = function(name, parent) {
        return createFile(name, parent, 'application/vnd.google-apps.folder');
    };

    self.createSpreadsheet = function(name, parent) {
        return createFile(name, parent, 'application/vnd.google-apps.spreadsheet');
    };

    /**
     * Create empty file in specific location
     *
     * @param name
     * @param parent
     * @param mimeType
     * @returns {promise|*|Function}
     */
    var createFile = function(name, parent, mimeType) {

        deferred2 = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred2.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        self.onDrive(function() {

            var data = {
                title: name,
                mimeType: mimeType
            };

            if (typeof parent !== 'undefined') {
                data['parents'] = [
                    {id: parent}
                ];
            }

            gapi.client.drive.files.insert({resource: data}).execute(function(file) {
                deferred2.resolve(file);
                $timeout.cancel(timeoutPromise);
                $rootScope.$apply();
            });
        });

        return deferred2.promise;
    };

    /**
     * Find files on google drive using given query
     *
     * @see https://developers.google.com/drive/search-parameters
     * @param query
     * @returns {promise|*|Function}
     */
    var findFiles = function(query) {

        var deferred = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        self.onDrive(function() {
            gapi.client.drive.files.list({
                'q': query
            }).execute(function(response) {
                deferred.resolve(typeof response.items === 'undefined' ? [] : response.items);
                $timeout.cancel(timeoutPromise);
                $rootScope.$apply();
            });
        });

        return deferred.promise;
    };
});