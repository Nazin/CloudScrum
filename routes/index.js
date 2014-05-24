var express = require('express'),
    router = express.Router();

router.get('/', function(req, res) {
    res.sendfile('./public/index.html');
});

module.exports = router;
