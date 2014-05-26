var express = require('express'),
    fs = require('fs'),
    helper = require('../app/helper'),
    path = require('path'),
    router = express.Router();

router.get('/', function(req, res) {

    var usersDir = path.join(req.query.path, helper.USERS_DIR), users = fs.readdirSync(usersDir),
        configurationFile = path.join(req.query.path, helper.CONFIG_FILE),
        configuration = {users: [], configuration: {}}, totalUsers = users.length, usersRead = 0, allUsersRead = false, configurationRead = false;

    for (var i = 0, l = users.length; i < l; i++) {

        (function(userEmail) {

            fs.readFile(path.join(usersDir, userEmail), helper.ENCODING, function(error, data) {

                configuration.users.push({email: userEmail, name: data});

                if (++usersRead === totalUsers) {
                    allUsersRead = true;
                    if (configurationRead) {
                        res.json(configuration);
                    }
                }
            });
        })(users[i]);
    }

    if (fs.existsSync(configurationFile)) {
        configuration.configuration = JSON.parse(fs.readFileSync(configurationFile, helper.ENCODING));
    }

    configurationRead = true;

    if (allUsersRead) {
        res.json(configuration);
    }
});

router.put('/', function(req, res) {

    var configurationFile = path.join(req.body.project.path, helper.CONFIG_FILE), configuration;

    if (fs.existsSync(configurationFile)) {
        configuration = JSON.parse(fs.readFileSync(configurationFile, helper.ENCODING));
    } else {
        configuration = {};
    }

    configuration[req.body.configuration] = req.body.data;

    fs.writeFileSync(configurationFile, helper.prepareForSave(configuration), helper.ENCODING);

    res.json(helper.prepareSuccessResponse())
});

module.exports = router;
