'use strict';

cloudScrum.service('Google', function Google($location, $rootScope, $q, $timeout, Configuration) {

    var clientId = '641738097836.apps.googleusercontent.com',
        apiKey = 'AIzaSyBduR27RDdEu6gN5ggwi6JFdqANv_xFpLk',
        scopes = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets https://spreadsheets.google.com/feeds/',
        oldSpreadsheetId = '0AoueeG57xFRRdFNDMl9lQ0JrQVMwQVc2STFxSVpRdUE',
        timeoutTime = 10000,
        isAuthorized = false,
        deferred = $q.defer(),
        deferred2,
        driveJSLoaded = false,
        self = this;

    self.ERROR_TIMEOUT = -1;
    self.HTTP_ERROR = -2;
    self.MISSING_FLOW_FILE = -3;

    self.isAuthorized = function() {
        return isAuthorized;
    };

    self.login = function() {
        if (typeof $rootScope.forceNewLogin !== 'undefined' && $rootScope.forceNewLogin) {
            deferred = $q.defer();
            self.handleClientLoad();
            $rootScope.forceNewLogin = false;
        }
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

    self.createFolder = function(name, parent) {
        return createFile(name, parent, 'application/vnd.google-apps.folder');
    };

    self.createSpreadsheet = function(name, parent) {
        return createFile(name, parent, 'application/vnd.google-apps.spreadsheet');
    };

    self.getBacklogStories = function(id) {
        return downloadExcelFile(id, function(XLSX, wb) {
            deferred2.resolve(readStories(XLSX, wb.Sheets[wb.SheetNames[0]], 4, backlogColumns, backlogTasksColumns));
        });
    };

    self.getReleaseStories = function(id) {

        return downloadExcelFile(id, function(XLSX, wb) {

            var iterations = [];

            for (var sheetName in wb.Sheets) {

                var sheet = wb.Sheets[sheetName], data = readStories(XLSX, sheet, 10, iterationColumns, iterationTasksColumns), closed = sheet[XLSX.utils.encode_cell({c: 8, r: 4})].v === 'Yes';

                iterations.push({
                    name: sheet[XLSX.utils.encode_cell({c: 1, r: 1})].v + (closed ? ' (closed)' : ''),
                    closed: closed,
                    startDate: sheet[XLSX.utils.encode_cell({c: 2, r: 4})].v,
                    endDate: sheet[XLSX.utils.encode_cell({c: 5, r: 4})].v,
                    stories: data.stories
                });
            }

            deferred2.resolve(iterations);
        });
    };

    self.saveBacklogStories = function(stories, id, name) {
        return saveSpreadsheet(id, 'backlog', function(builder, Style) {
            return prepareBacklog(builder, stories, name, Style);
        }, false);
    };

    self.saveRelease = function(parentId, iterations, name, newFile) {
        return saveSpreadsheet(parentId, 'release-' + name, function(builder, Style) {
            return prepareRelease(builder, iterations, Style);
        }, newFile);
    };

    self.updateFlowFile = function(flowFileId, parentId, data) {
        return prepareFileSave(function(timeoutPromise) {
            require(['JSZip'], function() {
                saveFile(typeof flowFileId === 'undefined' ? parentId : flowFileId, 'flow', typeof flowFileId === 'undefined', 'application/json', false, JSZipBase64.encode(JSON.stringify(data)), deferred2, timeoutPromise);
            });
        });
    };

    self.getFlowFile = function(parentId) {

        var deferred = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        findFiles('title = \'flow\' and \'' + parentId + '\' in parents and trashed = false and mimeType = \'application/json\'').then(function(files) {

            if (files.length === 0) {
                deferred.reject(self.MISSING_FLOW_FILE);
            } else {

                var xhr = new XMLHttpRequest();
                xhr.open('GET', files[0].downloadUrl);
                xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);

                xhr.onload = function() {

                    if (xhr.status === 200) {
                        deferred.resolve({projects: JSON.parse(xhr.responseText), flowFileId: files[0].id});
                    } else {
                        deferred.reject(self.HTTP_ERROR);
                    }

                    $timeout.cancel(timeoutPromise);
                };

                xhr.onerror = function() {
                    deferred.reject(self.HTTP_ERROR);
                    $timeout.cancel(timeoutPromise);
                };

                xhr.send();
            }
        }, function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    self.getPermissionsList = function(fileId) {

        var deferred = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        var request = gapi.client.drive.permissions.list({
            'fileId': fileId
        });

        request.execute(function(resp) {
            deferred.resolve(resp.items);
            $timeout.cancel(timeoutPromise);
            $rootScope.$apply();
        });

        return deferred.promise;
    };

    self.newPermission = function(fileId, email) {

        deferred2 = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred2.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        var request = gapi.client.drive.permissions.insert({
            fileId: fileId,
            resource: {
                value: email,
                type: 'user',
                role: 'writer'
            }
        });

        request.execute(function(resp) {
            deferred2.resolve(resp);
            $timeout.cancel(timeoutPromise);
            $rootScope.$apply();
        });

        return deferred2.promise;
    };

    self.deletePermission = function(fileId, permissionId) {

        deferred2 = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred2.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        var request = gapi.client.drive.permissions.delete({
            fileId: fileId,
            permissionId: permissionId
        });

        request.execute(function(resp) {
            deferred2.resolve(resp);
            $timeout.cancel(timeoutPromise);
            $rootScope.$apply();
        });

        return deferred2.promise;
    };

    var downloadExcelFile = function(id, callback) {

        deferred2 = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred2.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        require(['xlsx'], function(XLSX) {

            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://37.59.14.211/proxy');
            xhr.responseType = 'arraybuffer';
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            xhr.onload = function() {

                if (xhr.status === 200) {

                    var uInt8Array = new Uint8Array(this.response), i = uInt8Array.length, binaryString = new Array(i);

                    while (i--) {
                        binaryString[i] = String.fromCharCode(uInt8Array[i]);
                    }

                    var data = binaryString.join('');

                    callback(XLSX, XLSX.read(window.btoa(data), {type: 'base64'}));
                } else {
                    deferred2.reject(self.HTTP_ERROR);
                }

                $timeout.cancel(timeoutPromise);
            };

            xhr.onerror = function() {
                deferred2.reject(self.HTTP_ERROR);
                $timeout.cancel(timeoutPromise);
            };

            xhr.send('id=' + id + '&token=' + gapi.auth.getToken().access_token);
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

    var saveSpreadsheet = function(id, fileName, buildData, newFile) {
        return prepareFileSave(function(timeoutPromise) {
            require(['libs/excel-builder.js/excel-builder', 'styles'], function(builder, Style) {
                saveFile(id, fileName, newFile, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', true, buildData(builder, Style), deferred2, timeoutPromise);
            });
        });
    };

    var prepareFileSave = function(callback) {

        deferred2 = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred2.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        callback(timeoutPromise);

        return deferred2.promise;
    };

    var saveFile = function(id, fileName, newFile, mimeType, convert, data, deferred, timeoutPromise) {

        self.onDrive(function() {

            var boundary = '-------314159265358979323846', delimiter = "\r\n--" + boundary + "\r\n", closeDelimiter = "\r\n--" + boundary + "--";
            var metadata = {
                'title': fileName,
                'mimeType': mimeType
            };

            if (newFile) {
                metadata['parents'] = [
                    {id: id}
                ];
            }

            var requestBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: ' + mimeType + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' + '\r\n' + data + closeDelimiter;

            var request = gapi.client.request({
                'path': newFile ? '/upload/drive/v2/files' : '/upload/drive/v2/files/' + id,
                'method': newFile ? 'POST' : 'PUT',
                'params': {
                    'uploadType': 'multipart',
                    'convert': convert
                },
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': requestBody
            });

            request.execute(function(file) {
                deferred.resolve(file);
                $timeout.cancel(timeoutPromise);
                $rootScope.$apply();
            });
        });
    };

    var backlogColumns = ['id', 'epic', 'title', 'estimate', 'details'],
        backlogTasksColumns = ['', '', 'title', 'estimate', 'details'];

    var prepareBacklog = function(builder, stories, name, Style) {

        var workbook = builder.createWorkbook(), worksheet = workbook.createWorksheet({name: 'Backlog'}), i, j, n = backlogColumns.length, l = stories.length, maxRows = 14 + l, t, tl, tasksAdded = 0,
            nt = backlogTasksColumns.length, styles = Style(workbook);

        worksheet.setColumns([
            {width: 2},
            {width: 8},
            {width: 40},
            {width: 20},
            {width: 10},
            {width: 60}
        ]);

        for (i=0; i<l; i++) {
            maxRows += stories[i]['tasks'].length;
        }

        var data = prepareDefaultDataSet(styles.defaultCell, maxRows);

        data[1][1].value = name;
        data[1][1].metadata.style = styles.title.id;

        for (i=0; i<n; i++) {
            data[3][i+1].value = backlogColumns[i].capitalize();
            data[3][i+1].metadata.style = styles.header.id;
        }

        for (i=0; i<l; i++) {
            for (j=0; j<n; j++) {
                data[4+i+tasksAdded][j+1].value = typeof stories[i][backlogColumns[j]] === 'undefined' ? '' : stories[i][backlogColumns[j]];
                if ((i+tasksAdded)%2 === 0) {
                    data[4+i+tasksAdded][j+1].metadata.style = styles.oddCell.id;
                }
            }
            for (t=0,tl=stories[i]['tasks'].length; t<tl; t++) {
                ++tasksAdded;
                for (j=0; j<nt; j++) {
                    if (backlogTasksColumns[j] === '') {
                        continue;
                    }
                    data[4+i+tasksAdded][j+1].value = typeof stories[i]['tasks'][t][backlogTasksColumns[j]] === 'undefined' ? '' : stories[i]['tasks'][t][backlogTasksColumns[j]];
                    if ((i+tasksAdded)%2 === 0) {
                        data[4+i+tasksAdded][j+1].metadata.style = styles.taskOddCell.id;
                    } else {
                        data[4+i+tasksAdded][j+1].metadata.style = styles.taskDefaultCell.id;
                    }
                }
            }
        }

        worksheet.setData(data);
        worksheet.mergeCells('B2', 'G2');

        workbook.addWorksheet(worksheet);

        return builder.createFile(workbook);
    };

    var iterationColumns = ['id', 'epic', 'title', 'owner', 'status', 'estimate', 'effort', 'details'],
        iterationTasksColumns = ['', '', 'title', 'owner', 'status', 'estimate', 'effort', 'details'];

    var prepareRelease = function(builder, iterations, Style) {

        var workbook = builder.createWorkbook(), l = iterations.length, n = iterationColumns.length, nt = iterationTasksColumns.length, i, j, k, styles = Style(workbook), storiesStatuses = Configuration.getStoriesStatuses(), taskStatuses = Configuration.getTasksStatuses();

        for (i=0; i < l; i++) {

            var iteration = 'Iteration ' + (i+1), worksheet = workbook.createWorksheet({name: iteration}), s = iterations[i].stories.length, maxRows = 20 + s, t, tl, tasksAdded = 0;

            worksheet.setColumns([
                {width: 2},
                {width: 15},
                {width: 15},
                {width: 40},
                {width: 15},
                {width: 15},
                {width: 10},
                {width: 10},
                {width: 60}
            ]);

            var data = prepareDefaultDataSet(styles.defaultCell, maxRows);

            data[1][1].value = iteration;
            data[1][1].metadata.style = styles.title.id;

            data[4][1].value = 'Start date';
            data[4][1].metadata.style = styles.defaultRightCell.id;
            data[4][4].value = 'End date';
            data[4][4].metadata.style = styles.defaultRightCell.id;

            data[4][2].value = iterations[i].startDate;
            data[4][2].metadata.style = styles.oddBoldCell.id;
            data[4][5].value = iterations[i].endDate;
            data[4][5].metadata.style = styles.oddBoldCell.id;

            data[4][7].value = 'Closed';
            data[4][7].metadata.style = styles.defaultRightCell.id;
            data[4][8].value = iterations[i].closed ? 'Yes' : 'No';
            data[4][8].metadata.style = styles.oddBoldCell.id;

            data[6][1].value = 'Accepted';
            data[6][1].metadata.style = styles.defaultRightCell.id;
            data[6][4].value = 'Estimate';
            data[6][4].metadata.style = styles.defaultRightCell.id;

            data[6][2].value = 'SUMIF(F:F;"Accepted";G:G)';
            data[6][2].metadata.style = styles.oddBoldCell.id;
            data[6][2].metadata.type = 'formula';
            data[6][5].value = 'SUMIF(B:B;"<>";G:G)';
            data[6][5].metadata.style = styles.oddBoldCell.id;
            data[6][5].metadata.type = 'formula';

            for (j=0; j<n; j++) {
                data[9][j+1].value = iterationColumns[j].capitalize();
                data[9][j+1].metadata.style = styles.header.id;
            }

            for (k=0; k<s; k++) {
                if (typeof iterations[i].stories[k]['status'] === 'undefined') {
                    iterations[i].stories[k]['status'] = storiesStatuses[0];
                }
                for (j=0; j<n; j++) {
                    data[10+k+tasksAdded][j+1].value = typeof iterations[i].stories[k][iterationColumns[j]] === 'undefined' ? '' : iterations[i].stories[k][iterationColumns[j]];
                    if ((k+tasksAdded%2) === 0) {
                        data[10+k+tasksAdded][j+1].metadata.style = styles.oddCell.id;
                    }
                }
                for (t=0,tl=iterations[i].stories[k]['tasks'].length; t<tl; t++) {
                    if (typeof iterations[i].stories[k]['tasks'][t]['status'] === 'undefined') {
                        iterations[i].stories[k]['tasks'][t]['status'] = taskStatuses[0];
                    }
                    ++tasksAdded;
                    for (j=0; j<nt; j++) {
                        if (iterationTasksColumns[j] === '') {
                            continue;
                        }
                        data[10+k+tasksAdded][j+1].value = typeof iterations[i].stories[k]['tasks'][t][iterationTasksColumns[j]] === 'undefined' ? '' : iterations[i].stories[k]['tasks'][t][iterationTasksColumns[j]];
                        if ((k+tasksAdded)%2 === 0) {
                            data[10+k+tasksAdded][j+1].metadata.style = styles.taskOddCell.id;
                        } else {
                            data[10+k+tasksAdded][j+1].metadata.style = styles.taskDefaultCell.id;
                        }
                    }
                }
            }

            worksheet.setData(data);
            worksheet.mergeCells('B2', 'G2');

            workbook.addWorksheet(worksheet);
        }

        return builder.createFile(workbook);
    };

    var prepareDefaultDataSet = function(style, maxRows, maxCols) {

        var data = [], i, j;
        maxCols = maxCols || 20;

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

    var readStories = function(XLSX, sheet, startRow, columns, tasksColumns) {

        var r = startRow, val, j, tmp, tmp2, maxId = 0, stories = [], n = columns.length, nt = tasksColumns.length;

        if (typeof sheet[XLSX.utils.encode_cell({c: 3, r: r})] !== 'undefined') {

            while (typeof sheet[XLSX.utils.encode_cell({c: 3, r: r})].v !== 'undefined') {

                if (typeof sheet[XLSX.utils.encode_cell({c: 1, r: r})].v !== 'undefined') {

                    var story = {};

                    for (j=0; j<n; j++) {
                        val = sheet[XLSX.utils.encode_cell({c: j+1, r: r})].v;
                        if (typeof val !== 'undefined') {
                            story[columns[j]] = sheet[XLSX.utils.encode_cell({c: j+1, r: r})].v;
                        }
                    }

                    tmp2 = parseInt(story['id'].replace('S-', ''));
                    if (tmp2 > maxId) {
                        maxId = tmp2;
                    }

                    story['tasks'] = [];
                    stories.push(story);
                } else {

                    var task = {};

                    for (j=0; j<nt; j++) {
                        val = sheet[XLSX.utils.encode_cell({c: j+1, r: r})].v;
                        if (typeof val !== 'undefined' && tasksColumns[j] !== '') {
                            task[tasksColumns[j]] = sheet[XLSX.utils.encode_cell({c: j+1, r: r})].v;
                        }
                    }

                    tmp = stories[stories.length-1]['tasks'];
                    task['id'] = 'T-' + (tmp.length+1);

                    tmp.push(task);
                }

                r++;
            }
        }

        return {
            stories: stories,
            maxId: maxId
        };
    };
});