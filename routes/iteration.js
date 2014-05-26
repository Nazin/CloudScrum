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

    iteration.stories = [];

    if (totalFiles === 0) {
        res.json(iteration);
    } else {
        helper.readStories(files, iterationDir, function(stories) {
            iteration.stories = stories;
            res.json(iteration);
        });
    }
});

var userIterationStatus = function(iterationStatus, owner) {
    if (typeof iterationStatus.users[owner] === 'undefined') {
        iterationStatus.users[owner] = {
            storyPoints: 0,
            stories: 0,
            tasks: 0,
            tasksEstimated: 0,
            tasksEffort: 0
        };
    }
};

var updateReleaseStatusFile = function(res, releaseStatusFile, nextIterationId, iterationStatus, estimationDifference) {

    var releaseStatus = JSON.parse(fs.readFileSync(releaseStatusFile, helper.ENCODING));

    if (releaseStatus.iterations < nextIterationId) {
        releaseStatus.closed = true;
    } else {
        releaseStatus.activeIteration = nextIterationId;
    }

    releaseStatus.totalEstimated += estimationDifference;
    releaseStatus.totalAccepted += iterationStatus.velocity;

    iterationStatus.toBurn = releaseStatus.totalEstimated - releaseStatus.totalAccepted;

    releaseStatus.iterationsStatus.push(iterationStatus);

    fs.writeFileSync(releaseStatusFile, helper.prepareForSave(releaseStatus), helper.ENCODING);
    res.json(releaseStatus);
};

router.put('/:id', function(req, res) {

    if (req.body.close) {

        var releaseDir = path.join(req.body.project.path, helper.RELEASES_DIR, req.body.name), nextIterationId = parseInt(req.params.id) + 1, i, l, totalAccepted = req.body.accepted.length, acceptedRead = 0,
            iterationDir = path.join(releaseDir, req.params.id),
            nextIterationDir = path.join(releaseDir, nextIterationId.toString()),
            backlogDir = path.join(req.body.project.path, helper.BACKLOG_DIR),
            releaseStatusFile = path.join(releaseDir, helper.RELEASE_STATUS_FILE),
            iterationInfoFile = path.join(iterationDir, helper.ITERATION_INFO_FILE),
            nextIterationInfoFile = path.join(nextIterationDir, helper.ITERATION_INFO_FILE);

        var iterationStatus = {
            velocity: 0,
            acceptedStoriesCount: 0,
            tasksCount: 0,
            totalTasksEstimation: 0,
            totalTasksEffort: 0,
            toBurn: 0,
            users: {}
        };

        var iterationInfo = JSON.parse(fs.readFileSync(iterationInfoFile, helper.ENCODING)), estimationDifference;
        iterationInfo.closed = true;
        iterationInfo.onCloseEstimation = req.body.estimated;
        fs.writeFile(iterationInfoFile, helper.prepareForSave(iterationInfo), helper.ENCODING);

        estimationDifference = iterationInfo.onCloseEstimation - iterationInfo.firstEstimation;

        if (!req.body.closeRelease && req.body.moveEstimation !== 0) {

            fs.readFile(nextIterationInfoFile, helper.ENCODING, function(error, data) {
                var nextIterationInfo = JSON.parse(data);
                nextIterationInfo.firstEstimation += req.body.moveEstimation;
                fs.writeFileSync(nextIterationInfoFile, helper.prepareForSave(nextIterationInfo), helper.ENCODING);
            });
        } //TODO else if req.body.closeRelease && req.body.moveEstimation !== 0 -> nie trzeba zaktualizować totalEstimation w releaseFile?

        for (i = 0, l = req.body.move.length; i < l; i++) {
            var storyFileName = req.body.move[i] + helper.STORY_SUFFIX;
            if (req.body.closeRelease) {
                fs.rename(path.join(iterationDir, storyFileName), path.join(backlogDir, storyFileName));
            } else {
                fs.rename(path.join(iterationDir, storyFileName), path.join(nextIterationDir, storyFileName));
            }
        }

        for (i = 0; i < totalAccepted; i++) {

            fs.readFile(path.join(iterationDir, req.body.accepted[i] + helper.STORY_SUFFIX), helper.ENCODING, function(error, data) {

                var story = JSON.parse(data);

                iterationStatus.velocity += story.estimate;
                iterationStatus.acceptedStoriesCount++;
                iterationStatus.tasksCount += story.tasks.length;

                userIterationStatus(iterationStatus, story.owner);

                iterationStatus.users[story.owner].stories++;
                iterationStatus.users[story.owner].storyPoints += story.estimate;

                for (var j = 0, lj = story.tasks.length; j < lj; j++) {

                    iterationStatus.totalTasksEstimation += story.tasks[j].estimate;
                    iterationStatus.totalTasksEffort += story.tasks[j].effort;

                    userIterationStatus(iterationStatus, story.tasks[j].owner);

                    iterationStatus.users[story.tasks[j].owner].tasks++;
                    iterationStatus.users[story.tasks[j].owner].tasksEstimated += story.tasks[j].estimate;
                    iterationStatus.users[story.tasks[j].owner].tasksEffort += story.tasks[j].effort;
                }

                if (++acceptedRead === totalAccepted) {
                    updateReleaseStatusFile(res, releaseStatusFile, nextIterationId, iterationStatus, estimationDifference);
                }
            });
        }

        if (totalAccepted === 0) {
            updateReleaseStatusFile(res, releaseStatusFile, nextIterationId, iterationStatus, estimationDifference);
        }
    } else {
        res.json(helper.prepareErrorResponse('Bad request'));
    }
});

router.put('/:id/:sid', function(req, res) {
    helper.editIterationStory(req, res, function(story) {
        story[req.body.field] = req.body.value;
    });
});

router.post('/:id/:sid/tasks', function(req, res) {
    helper.editIterationStory(req, res, function(story) {
        story.tasks.push(req.body.task);
    });
});

router.put('/:id/:sid/tasks/:tid', function(req, res) {
    helper.editIterationStory(req, res, function(story) {
        if (typeof req.body.field === 'object') {
            for (var i = 0, l = req.body.field.length; i < l; i++) {
                story.tasks[req.params.tid][req.body.field[i]] = req.body.value[i];
            }
        } else {
            story.tasks[req.params.tid][req.body.field] = req.body.value;
        }
    });
});

module.exports = router;
