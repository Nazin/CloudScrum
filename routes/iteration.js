var express = require('express'),
    fs = require('fs'),
    helper = require('../app/helper'),
    path = require('path'),
    router = express.Router();

router.get('/:id', function(req, res) {

    var iterationDir = path.join(req.query.path, helper.RELEASES_DIR, req.query.name, req.params.id), files = fs.readdirSync(iterationDir), totalFiles = files.length, iteration;

    for (var i = files.length - 1; i >= 0; i--) {
        if (files[i].slice(-helper.STORY_SUFFIX.length) !== helper.STORY_SUFFIX) {
            if (files[i] === helper.ITERATION_INFO_FILE) {
                iteration = JSON.parse(fs.readFileSync(path.join(iterationDir, files[i]), helper.ENCODING));
            }
            files.splice(i, 1);
            totalFiles--;
        }
    }

    if (totalFiles === 0 || typeof iteration === 'undefined') {
        res.json(iteration || {stories:[]});
    } else {

        iteration.stories = [];

        helper.readStories(files, iterationDir, function(stories) {
            iteration.stories = stories;
            res.json(iteration);
        });
    }
});

router.post('/:id/:sid/tasks', function(req, res) {
    helper.editIterationStory(req, res, function(story) {
        story.tasks.push(req.body.task);
    });
});

module.exports = router;
