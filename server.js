var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());

app.use('/', require('./routes/index'));
app.use('/configuration', require('./routes/configuration'));
app.use('/projects', require('./routes/projects'));
app.use('/backlog', require('./routes/backlog'));
app.use('/releases', require('./routes/releases'));
app.use('/iteration', require('./routes/iteration'));

app.listen(process.env.PORT || 1337);

console.log('Server started');
