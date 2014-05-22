var express = require('express'),
    fs = require('fs'),
    helper = require('../app/helper'),
    path = require('path'),
    router = express.Router();

router.post('/', function(req, res) {

    console.log('Project creation on: ' + req.body.path);

    if (!fs.existsSync(req.body.path)) {
        res.json(helper.prepareErrorResponse('Provided path does not exist'));
        return;
    }

    var projectFile = path.join(req.body.path, 'cloudscrum.project'),
        usersDir = path.join(req.body.path, 'users'),
        backlogDir = path.join(req.body.path, 'backlog'),
        releasesDir = path.join(req.body.path, 'releases');

    fs.exists(projectFile, function(exists) {
        if (!exists) {
            fs.writeFile(projectFile, req.body.name);
        }
    });

    helper.createDir(usersDir, function() {
        fs.writeFile(path.join(usersDir, req.body.user.email), req.body.user.name);
    });

    helper.createDir(backlogDir);
    helper.createDir(releasesDir);

    res.json(helper.prepareSuccessResponse());
});

module.exports = router;
