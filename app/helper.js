var fs = require('fs');

module.exports = {

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
    }
};
