var express = require('express'),
    fs = require('fs'),
    helper = require('../app/helper'),
    path = require('path'),
    router = express.Router();

router.get('/', function(req, res) {

    var releasesDir = path.join(req.query.path, helper.RELEASES_DIR), files = fs.readdirSync(releasesDir), totalFiles = files.length, filesStated = 0, releases = {};

    for (var i = 0, l = files.length; i < l; i++) {

        (function(fileName) {

            var file = path.join(releasesDir, fileName);

            fs.stat(file, function(err, stat) {

                if (stat && stat.isDirectory()) {
                    releases[fileName] = JSON.parse(fs.readFileSync(path.join(file, helper.RELEASE_STATUS_FILE)));
                }

                if (++filesStated === totalFiles) {
                    res.json(releases);
                }
            });
        })(files[i]);
    }

    if (totalFiles === 0) {
        res.json(releases);
    }
});

router.post('/', function(req, res) {

    var releasesDir = path.join(req.body.project.path, helper.RELEASES_DIR),
        releaseDir = path.join(releasesDir, req.body.release.name),
        backlogDir = path.join(req.body.project.path, helper.BACKLOG_DIR);

    if (fs.existsSync(releaseDir)) {
        res.json(helper.prepareErrorResponse('Release with given name already exists'));
        return;
    }

    var allStories = 0, storiesMoved = 0;

    helper.createDir(releasesDir, function() {

        fs.mkdirSync(releaseDir);
        fs.writeFile(path.join(releaseDir, helper.RELEASE_STATUS_FILE), helper.prepareForSave({closed: false, activeIteration: 1, iterations: req.body.iterations.length, iterationsStatus: []}), helper.ENCODING);

        for (var i = 0, l = req.body.iterations.length; i < l; i++) {

            (function(iterationData, id) {

                var iterationDir = path.join(releaseDir, id);

                fs.mkdir(iterationDir, function() {

                    for (var j = 0, lj = iterationData.stories.length; j < lj; j++) {
                        var storyFileName = iterationData.stories[j] + helper.STORY_SUFFIX;
                        fs.rename(path.join(backlogDir, storyFileName), path.join(iterationDir, storyFileName), function() {
                            if (++storiesMoved === allStories) {
                                res.json(helper.prepareSuccessResponse());
                            }
                        });
                    }

                    delete iterationData.stories;
                    fs.writeFile(path.join(iterationDir, helper.ITERATION_INFO_FILE), helper.prepareForSave(iterationData), helper.ENCODING);
                })
            })(req.body.iterations[i], (i + 1).toString());

            allStories += req.body.iterations[i].stories.length;
        }
    });
});

module.exports = router;
