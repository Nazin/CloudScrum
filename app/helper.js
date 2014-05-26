var fs = require('fs'),
    path = require('path');

module.exports = {

    USERS_DIR: 'users',
    BACKLOG_DIR: 'backlog',
    RELEASES_DIR: 'releases',

    ID_FILE: 'id',
    ITERATION_INFO_FILE: 'info.json',
    RELEASE_STATUS_FILE: 'status.json',
    CONFIG_FILE: 'configuration.json',

    STORY_SUFFIX: '.story.json',

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

    editStory: function(storyFile, res, callback) {

        var story = JSON.parse(fs.readFileSync(storyFile, this.ENCODING));

        callback(story);

        fs.writeFileSync(storyFile, this.prepareForSave(story), this.ENCODING);
        res.json(this.prepareSuccessResponse());
    },

    editBacklogStory: function(req, res, callback) {
        this.editStory(path.join(req.body.project.path, this.BACKLOG_DIR, req.params.id + this.STORY_SUFFIX), res, callback);
    },

    editIterationStory: function(req, res, callback) {
        this.editStory(path.join(req.body.project.path, this.RELEASES_DIR, req.body.name, req.params.id, req.params.sid + this.STORY_SUFFIX), res, callback);
    },

    readStories: function(files, dir, callback) {

        var totalFiles = files.length, filesRead = 0, stories = [], helper = this;

        for (var i = 0; i < totalFiles; i++) {

            (function(fileName) {

                fs.readFile(path.join(dir, fileName), helper.ENCODING, function(error, data) {

                    try {
                        stories.push(JSON.parse(data));
                    } catch (err) {
                        console.log('Story: ' + dir + '/' + fileName + ' corrupted!');
                    }

                    if (++filesRead === totalFiles) {

                        stories.sort(function(a, b) {
                            return a.position - b.position;
                        });

                        callback(stories);
                    }
                });
            })(files[i]);
        }
    }
};
