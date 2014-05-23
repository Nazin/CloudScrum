var express = require('express'),
    fs = require('fs'),
    helper = require('../app/helper'),
    path = require('path'),
    router = express.Router();

router.get('/', function(req, res) {

    var backlogDir = path.join(req.query.path, helper.BACKLOG_DIR);

    var files = fs.readdirSync(backlogDir), stories = [], filesRead = 0, totalFiles = files.length, i, l;

    for (i = files.length-1; i >= 0 ; i--) {
        if (files[i].slice(-helper.STORY_SUFFIX.length) !== helper.STORY_SUFFIX) {
            files.splice(i, 1);
            totalFiles--;
        }
    }

    for (i = 0, l = files.length; i < l; i++) {

        (function(fileName) {

            fs.readFile(path.join(backlogDir, fileName), helper.ENCODING, function(error, data) {

                try {
                    stories.push(JSON.parse(data));
                } catch (err) {
                    console.log('Story: ' + helper.BACKLOG_DIR + '/' + fileName + ' corrupted!');
                }

                if (++filesRead === totalFiles) {

                    stories.sort(function(a, b) {
                        return a.position - b.position;
                    });

                    res.json(stories);
                }
            });
        })(files[i]);
    }

    if (totalFiles === 0) {
        res.json(stories);
    }
});

router.post('/', function(req, res) {

    var backlogDir = path.join(req.body.project.path, helper.BACKLOG_DIR), idFile = path.join(backlogDir, helper.ID_FILE);

    helper.createDir(backlogDir, function() {

        fs.readFile(idFile, function(error, data) {

            var nextId = 1;

            if (typeof data !== 'undefined') {
                nextId = parseInt(data);
            }

            req.body.story.id = nextId;

            fs.writeFileSync(path.join(backlogDir, nextId + helper.STORY_SUFFIX), helper.prepareForSave(req.body.story), helper.ENCODING);
            fs.writeFileSync(idFile, ++nextId, helper.ENCODING);

            res.json(helper.prepareSuccessResponse({id: 0}));
        });
    });
});

router.put('/order', function(req, res) {

    var backlogDir = path.join(req.body.project.path, helper.BACKLOG_DIR);

    for (var id in req.body.positions) {

        (function(storyFile, position) {

            fs.readFile(storyFile, helper.ENCODING, function(error, data) {
                var story = JSON.parse(data);
                story.position = position;
                fs.writeFileSync(storyFile, helper.prepareForSave(story), helper.ENCODING);
            });
        })(path.join(backlogDir, id + helper.STORY_SUFFIX), req.body.positions[id]);
    }

    res.json(helper.prepareSuccessResponse());
});

router.put('/:id', function(req, res) {
    helper.editBacklogStory(req, res, function(story) {
        story[req.body.field] = req.body.value;
    });
});

router.post('/:id/tasks', function(req, res) {
    helper.editBacklogStory(req, res, function(story) {
        story.tasks.push(req.body.task);
    });
});

router.put('/:id/tasks/:tid', function(req, res) {
    helper.editBacklogStory(req, res, function(story) {
        story.tasks[req.params.tid][req.body.field] = req.body.value;
    });
});

module.exports = router;
