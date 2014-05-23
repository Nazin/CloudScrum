var express = require('express'),
    fs = require('fs'),
    helper = require('../app/helper'),
    path = require('path'),
    router = express.Router();

router.get('/', function(req, res) {

    var backlogDir = path.join(req.query.path, helper.BACKLOG_DIR);

    var files = fs.readdirSync(backlogDir), stories = [], filesRead = 0, totalFiles = files.length;

    for (var i = 0, l = files.length; i < l; i++) {

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
});

router.post('/', function(req, res) {

    var backlogDir = path.join(req.body.project.path, helper.BACKLOG_DIR);

    helper.createDir(backlogDir, function() {

        var files = fs.readdirSync(backlogDir), nextId = 1;

        if (files.length !== 0) {

            files.sort(function(a, b) {
                return parseInt(a.replace('.json', '')) - parseInt(b.replace('.json', ''));
            });

            nextId = parseInt(files[files.length - 1].replace('.json', ''));
            nextId++;
        }

        req.body.story.id = nextId;

        fs.writeFileSync(path.join(backlogDir, nextId + '.json'), helper.prepareForSave(req.body.story), helper.ENCODING);

        res.json(helper.prepareSuccessResponse({id: nextId}));
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
        })(path.join(backlogDir, id + '.json'), req.body.positions[id]);
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
