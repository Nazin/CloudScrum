var fs = require('fs'),
    path = require('path');

module.exports = {

    USERS_DIR: 'users',
    BACKLOG_DIR: 'backlog',
    RELEASES_DIR: 'releases',

    ID_FILE: 'id',

    ENCODING: 'utf8',

    prepareErrorResponse: function(message) {
        return {status: 'error', message: message};
    },

    prepareSuccessResponse: function(data) {
        return {status: 'success', data: data || {}};
    },

    createDir: function(path, alwaysCallback) {
        fs.exists(path, function(exists) {
            if (!exists) {
                fs.mkdirSync(path);
            }
            if (alwaysCallback) {
                alwaysCallback();
            }
        });
    },

    prepareForSave: function(data) {
        return JSON.stringify(data, null, '\t');
    },

    editBacklogStory: function(req, res, callback) {

        var backlogDir = path.join(req.body.project.path, this.BACKLOG_DIR), storyFile = path.join(backlogDir, req.params.id + '.json');
        var story = JSON.parse(fs.readFileSync(storyFile, this.ENCODING));

        callback(story);

        fs.writeFileSync(storyFile, this.prepareForSave(story), this.ENCODING);

        res.json(this.prepareSuccessResponse());
    }
};
