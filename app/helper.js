var fs = require('fs');

module.exports = {

    USERS_DIR: 'users',
    BACKLOG_DIR: 'backlog',
    RELEASES_DIR: 'releases',

    ENCODING: 'utf8',

    prepareErrorResponse: function(message) {
        return {status: 'error', message: message};
    },

    prepareSuccessResponse: function(data) {
        return {status: 'success', data: data || {}};
    },

    createDir: function(path, allwaysCallback) {
        fs.exists(path, function(exists) {
            if (!exists) {
                fs.mkdirSync(path);
            }
            if (allwaysCallback) {
                allwaysCallback();
            }
        });
    },

    prepareForSave: function(data) {
        return JSON.stringify(data, null, '\t');
    }
};
