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
    self.HTTP_ERROR = -2;

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
            deferred2.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        $.getScript('https://spreadsheets.google.com/feeds/cells/' + id + '/1/private/full?access_token=' + gapi.auth.getToken().access_token + '&alt=json-in-script&callback=receiveBacklogCells', function() {
            $timeout.cancel(timeoutPromise);
        });

        return deferred2.promise;
    };

    self.getReleaseStories = function(id) {

        deferred2 = $q.defer();

        var timeoutPromise = $timeout(function() {
            deferred2.reject(self.ERROR_TIMEOUT);
            $rootScope.$apply();
        }, timeoutTime);

        require(['xlsx'], function(XLSX) {

            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://docs.google.com/feeds/download/spreadsheets/Export?key=' + id + '&exportFormat=xlsx');
            xhr.responseType = 'arraybuffer';
            xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
            xhr.onload = function() {

                if (xhr.status === 200) {

                    var uInt8Array = new Uint8Array(this.response), i = uInt8Array.length, binaryString = new Array(i);

                    while (i--) {
                        binaryString[i] = String.fromCharCode(uInt8Array[i]);
                    }

                    var data = binaryString.join(''), wb = XLSX.read(window.btoa(data), {type: 'base64'}), iterations = [], n = iterationColumns.length;

                    for (var sheetName in wb.Sheets) {

                        var sheet = wb.Sheets[sheetName], stories = [], r = 10;

                        while (typeof sheet[XLSX.utils.encode_cell({c: 3, r: r})].v !== 'undefined') {

                            var story = {};

                            for (var j=0; j<n; j++) {
                                var val = sheet[XLSX.utils.encode_cell({c: j+1, r: r})].v;
                                if (typeof val !== 'undefined') {
                                    story[iterationColumns[j]] = sheet[XLSX.utils.encode_cell({c: j+1, r: r})].v;
                                }
                            }

                            stories.push(story);
                            r++;
                        }

                        iterations.push({
                            startDate: sheet[XLSX.utils.encode_cell({c: 2, r: 4})].v,
                            endDate: sheet[XLSX.utils.encode_cell({c: 5, r: 4})].v,
                            stories: stories
                        });
                    }

                    deferred2.resolve(iterations);
                } else {
                    deferred2.reject(self.HTTP_ERROR);
                }

                $timeout.cancel(timeoutPromise);
            };

            xhr.onerror = function() {
                deferred2.reject(self.HTTP_ERROR);
                $timeout.cancel(timeoutPromise);
            };

            xhr.send();
        });

        return deferred2.promise;
    };

    self.saveBacklogStories = function(stories, id, name) {
        return saveSpreadsheet(id, 'backlog', function(builder) {
            return prepareBacklog(builder, stories, name);
        }, false);
    };

    self.saveRelease = function(parentId, iterations, name, newFile) {
        return saveSpreadsheet(parentId, 'release-' + name, function(builder) {
            return prepareRelease(builder, iterations);
        }, newFile);
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
            require(['libs/excel-builder.js/excel-builder'], function(builder) {
                saveFile(id, fileName, newFile, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', true, buildData(builder), deferred2, timeoutPromise);
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
    }, defaultRightCellStyles = {
        font: {
            color: 'FF404040',
            size: 10
        },
        alignment: {
            horizontal: 'right'
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
    }, oddBoldCellStyles = {
        font: {
            bold: true,
            color: 'FF404040',
            size: 10
        },
        alignment: {
            horizontal: 'left'
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

    var iterationColumns = ['id', 'epic', 'title', 'owner', 'status', 'estimate', 'effort', 'details'];

    var prepareRelease = function(builder, iterations) {

        var workbook = builder.createWorkbook(), l = iterations.length, n = iterationColumns.length, i, j, k;
        var stylesheet = workbook.getStyleSheet(),
            titleStyle = stylesheet.createFormat(titleStyles),
            headerStyle = stylesheet.createFormat(headerCellStyles),
            oddCellStyle = stylesheet.createFormat(oddCellStyles),
            oddBoldCellStyle = stylesheet.createFormat(oddBoldCellStyles),
            defaultCellStyle = stylesheet.createFormat(defaultCellStyles),
            defaultRightCellStyle = stylesheet.createFormat(defaultRightCellStyles);

        for (i=0; i < l; i++) {

            var iteration = 'Iteration ' + (i+1), worksheet = workbook.createWorksheet({name: iteration}), s = iterations[i].stories.length, maxRows = 20 + s;

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

            var data = prepareDefaultDataSet(defaultCellStyle, maxRows);

            data[1][1].value = iteration;
            data[1][1].metadata.style = titleStyle.id;

            data[4][1].value = 'Start date';
            data[4][1].metadata.style = defaultRightCellStyle.id;
            data[4][4].value = 'End date';
            data[4][4].metadata.style = defaultRightCellStyle.id;

            data[4][2].value = iterations[i].startDate;
            data[4][2].metadata.style = oddBoldCellStyle.id;
            data[4][5].value = iterations[i].endDate;
            data[4][5].metadata.style = oddBoldCellStyle.id;

            data[6][1].value = 'Accepted';
            data[6][1].metadata.style = defaultRightCellStyle.id;
            data[6][4].value = 'Estimate';
            data[6][4].metadata.style = defaultRightCellStyle.id;

            data[6][2].value = 'SUMIF(F:F;"Accepted";G:G)';
            data[6][2].metadata.style = oddBoldCellStyle.id;
            data[6][2].metadata.type = 'formula';
            data[6][5].value = 'SUMIF(B:B;"<>";G:G)';
            data[6][5].metadata.style = oddBoldCellStyle.id;
            data[6][5].metadata.type = 'formula';

            for (j=0; j<n; j++) {
                data[9][j+1].value = iterationColumns[j].capitalize();
                data[9][j+1].metadata.style = headerStyle.id;
            }

            for (k=0; k<s; k++) {
                for (j=0; j<n; j++) {
                    data[10+k][j+1].value = typeof iterations[i].stories[k][iterationColumns[j]] === 'undefined' ? '' : iterations[i].stories[k][iterationColumns[j]];
                    if (k%2 === 0) {
                        data[10+k][j+1].metadata.style = oddCellStyle.id;
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