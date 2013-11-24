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

    self.getBacklogStories = function(id) {

        deferred2 = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        $.getScript('https://spreadsheets.google.com/feeds/cells/' + id + '/od6/private/full?access_token=' + gapi.auth.getToken().access_token + '&alt=json-in-script&callback=receiveBacklogCells', function() {
            $timeout.cancel(timeoutPromise);
        });

        return deferred2.promise;
    };

    self.saveBacklogStories = function(stories, id, name) {

        deferred2 = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        require(['libs/excel-builder.js/excel-builder'], function(builder) {//TODO refactor entire app to use require
            self.onDrive(function() {

                var boundary = '-------314159265358979323846', delimiter = "\r\n--" + boundary + "\r\n", closeDelimiter = "\r\n--" + boundary + "--";
                var metadata = {
                    'title': 'backlog',
                    'mimeType': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                };

                var requestBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n' + 'Content-Transfer-Encoding: base64\r\n' + '\r\n' + prepareBacklog(builder, stories, name) + closeDelimiter;

                var request = gapi.client.request({
                    'path': '/upload/drive/v2/files/' + id,
                    'method': 'PUT',
                    'params': {
                        'uploadType': 'multipart',
                        'convert': true
                    },
                    'headers': {
                        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                    },
                    'body': requestBody
                });

                request.execute(function(file) {
                    deferred2.resolve(file);
                    $timeout.cancel(timeoutPromise);
                    $rootScope.$apply();
                });
            });
        });

        return deferred2.promise;
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

    var defaultCellStyles = {
        font: {
            color: 'FF404040',
            size: 10
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFFFFFFF'
        },
        border: {
            bottom: {color: 'FFFFFFFF', style: 'thin'},
            top: {color: 'FFFFFFFF', style: 'thin'},
            left: {color: 'FFFFFFFF', style: 'thin'},
            right: {color: 'FFFFFFFF', style: 'thin'}
        }
    }, oddCellStyles = {
        font: {
            color: 'FF404040',
            size: 10
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFF0F9F9'
        },
        border: {
            bottom: {color: 'FFF0F9F9', style: 'thin'},
            top: {color: 'FFF0F9F9', style: 'thin'},
            left: {color: 'FFF0F9F9', style: 'thin'},
            right: {color: 'FFF0F9F9', style: 'thin'}
        }
    }, headerCellStyles = {
        font: {
            bold: true,
            color: 'FFFFFFFF',
            size: 11
        },
        alignment: {
            horizontal: 'center'
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FF404040'
        },
        border: {
            bottom: {color: 'FF404040', style: 'thin'},
            top: {color: 'FF404040', style: 'thin'},
            left: {color: 'FF404040', style: 'thin'},
            right: {color: 'FF404040', style: 'thin'}
        }
    }, titleStyles = {
        font: {
            color: 'FF00AFDB',
            size: 24,
            family: 'Georgia'
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFFFFFFF'
        },
        border: {
            bottom: {color: 'FFFFFFFF', style: 'thin'},
            top: {color: 'FFFFFFFF', style: 'thin'},
            left: {color: 'FFFFFFFF', style: 'thin'},
            right: {color: 'FFFFFFFF', style: 'thin'}
        }
    };

    var backlogColumns = ['id', 'title', 'epic', 'estimate', 'details'],
        backlogIntColumns = [false, false, false, true, false];

    var prepareBacklog = function(builder, stories, name) {

        var workbook = builder.createWorkbook(), worksheet = workbook.createWorksheet({name: 'Backlog'}), i, j, n = backlogColumns.length, l = stories.length, maxRows = 14 + l;
        var stylesheet = workbook.getStyleSheet(),
            titleStyle = stylesheet.createFormat(titleStyles),
            headerStyle = stylesheet.createFormat(headerCellStyles),
            oddCellStyle = stylesheet.createFormat(oddCellStyles),
            defaultCellStyle = stylesheet.createFormat(defaultCellStyles);

        worksheet.setColumns([
            {width: 2},
            {width: 8},
            {width: 40},
            {width: 20},
            {width: 10},
            {width: 60}
        ]);

        var data = prepareDefaultDataSet(defaultCellStyle, maxRows);

        data[1][1].value = name;
        data[1][1].metadata.style = titleStyle.id;

        for (i=0; i<n; i++) {
            data[3][i+1].value = backlogColumns[i].capitalize();
            data[3][i+1].metadata.style = headerStyle.id;
        }

        for (i=0; i<l; i++) {
            for (j=0; j<n; j++) {
                data[4+i][j+1].value = typeof stories[i][backlogColumns[j]] === 'undefined' ? '' : stories[i][backlogColumns[j]];
                if (i%2 === 0) {
                    data[4+i][j+1].metadata.style = oddCellStyle.id;
                }
            }
        }

        worksheet.setData(data);
        worksheet.mergeCells('B2', 'G2');

        workbook.addWorksheet(worksheet);

        return builder.createFile(workbook);
    };

    var prepareDefaultDataSet = function(style, maxRows, maxCols) {

        var data = [], i, j;

        if (typeof maxCols === 'undefined') {
            maxCols = 20;
        }

        if (maxRows < 20) {
            maxRows = 20;
        }

        for (i=0; i<maxRows; i++) {
            data[i] = [];
            for (j=0; j<maxCols; j++) {
                data[i][j] = {value: '', metadata: {style: style.id}};
            }
        }

        return data;
    };

    window.receiveBacklogCells = function(data) {

        var tmp, tmp2, stories = [], row, col, maxId = 0;

        if (typeof data.feed.entry !== 'undefined') {
            for (var i = 0; i < data.feed.entry.length; i++) {

                tmp = data.feed.entry[i].gs$cell;
                row = tmp.row - 5;
                col = tmp.col - 2;

                if (row < 0 || col < 0 || col > 4) {
                    continue;
                }

                if (typeof stories[row] === 'undefined') {
                    stories[row] = {};
                }

                stories[row][backlogColumns[col]] = backlogIntColumns[col] ? parseInt(tmp.$t) : tmp.$t;

                if (col === 0) {
                    tmp2 = parseInt(tmp.$t.replace('S-', ''));
                    if (tmp2 > maxId) {
                        maxId = tmp2;
                    }
                }
            }
        }

        deferred2.resolve({stories: stories, maxId: maxId});
        $rootScope.$apply();
    };

    //TODO should be moved to some more appropriate place
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
});