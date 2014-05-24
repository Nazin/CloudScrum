var express = require('express'),
    fs = require('fs'),
    helper = require('../app/helper'),
    path = require('path'),
    router = express.Router();

router.get('/', function(req, res) {

    var usersDir = path.join(req.query.path, helper.USERS_DIR), users = fs.readdirSync(usersDir), configuration = {users: [], configuration: {}}, totalUsers = users.length, usersRead = 0;

    for (var i = 0, l = users.length; i < l; i++) {

        (function(userEmail) {

            fs.readFile(path.join(usersDir, userEmail), helper.ENCODING, function(error, data) {

                configuration.users.push({email: userEmail, name: data});

                if (++usersRead === totalUsers) {
                    res.json(configuration);
                }
            });
        })(users[i]);
    }

    //TODO grab configuration.json file from project directory (if exists)
});

module.exports = router;
