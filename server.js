var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());

app.use('/', require('./routes/index'));
app.use('/projects', require('./routes/projects'));

app.listen(process.env.PORT || 1337);

console.log('Server started');
