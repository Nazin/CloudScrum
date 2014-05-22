var express = require('express'),
    fs = require('fs'),
    helper = require('../app/helper'),
    path = require('path'),
    router = express.Router();

router.get('/', function(req, res) {

    var backlogDir = path.join(req.query.path, helper.BACKLOG_DIR);

    var files = fs.readdirSync(backlogDir), stories = [], filesRead = 0, totalFiles = files.length;

    for (var i = 0, l = files.length; i < l; i++) {

        fs.readFile(path.join(backlogDir, files[i]), helper.ENCODING, function(error, data) {

            stories.push(JSON.parse(data));

            if (++filesRead === totalFiles) {

                stories.sort(function(a, b) {
                    return a.position - b.position;
                });

                res.json(stories);
            }
        });
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

router.put('/:id', function(req, res) {

    var backlogDir = path.join(req.body.project.path, helper.BACKLOG_DIR), storyFile = path.join(backlogDir, req.params.id + '.json');

    var data = JSON.parse(fs.readFileSync(storyFile, helper.ENCODING));
    data[req.body.field] = req.body.value;

    fs.writeFileSync(storyFile, helper.prepareForSave(data), helper.ENCODING);

    res.json(helper.prepareSuccessResponse());
});

module.exports = router;
