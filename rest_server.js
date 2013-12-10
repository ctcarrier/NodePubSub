var restify = require('restify');

var topics = {};
var subscriptions = {};

function getTopic(req, res, next) {

    if (req.params.name in topics) {
        res.send(200, {
            name: req.params.name
        });
    } else {
        res.send(404);
    }
    return next();
}

function saveTopic(req, res, next) {
    if (req.body.name in topics) {
        res.send(200, req.body);
    } else {
        topics[req.body.name] = [];
        res.send(201, req.body);
    }
    return next();
}

function saveMessage(req, res, next) {
    if (req.params.name in topics) {
        topics[req.params.name].push(req.body);
        res.send(201, req.body);
    } else {
        topics[req.params.name] = [];
        topics[req.params.name].push(req.body);
        res.send(201, req.body);
    }
    return next();
}

function getMessagesByTopic(req, res, next) {
    if (req.params.name in topics) {
        if (req.username in subscriptions && req.params.name in subscriptions[req.username].topics && subscriptions[req.username].topics[req.params.name] == true) {
	    var response = {};
	    response[req.params.name] = topics[req.params.name];
            res.send(200, response);
        } else {
            res.send(new restify.NotAuthorizedError('Not subscribed'));
        }
    } else {
        res.send(404);
    }
    return next();
}

function getMessages(req, res, next) {
    if (req.username in subscriptions) {
        var response = {};
        for (var key in subscriptions[req.username].topics) {
            if (subscriptions[req.username].topics[key] == true) {
                response[key] = topics[key];
            }
        }

        res.send(200, response);
    } else {
        res.send(404);
    }

    return next();
}

function addSubscription(req, res, next) {
    if (!(req.username in subscriptions)) {
        subscriptions[req.username] = {
            topics: {}
        }
    }
    subscriptions[req.username].topics[req.params.name] = true;
    res.send(204);
    return next();
}

function removeSubscription(req, res, next) {
    if (!(req.username in subscriptions)) {
        subscriptions[req.username] = {
            topics: {}
        }
    }
    subscriptions[req.username].topics[req.params.name] = false;
    res.send(204);
    return next();
}

function pong(req, res, next) {
    res.send(200, "Pong: " + req.header('If-Modified-Since'));
    return next();
}

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
    return next();
}

var server = restify.createServer();

server.use(restify.bodyParser({
    mapParams: false
}));
server.use(restify.authorizationParser());
server.use(function authenticate(req, res, next) {
    if (!req.authorization.basic) {
        return next(new restify.NotAuthorizedError());
    } else {
        return next();
    }
});

server.get('/topics/:name', getTopic);
server.put('/topics/:name/subscriptions', addSubscription);
server.del('/topics/:name/subscriptions', removeSubscription);
server.post('/topics', saveTopic);
server.post('/topics/:name/messages', saveMessage);
server.get('/topics/:name/messages', getMessagesByTopic);
server.get('/messages', getMessages);
server.get('/ping', pong);
server.get('/hello/:name', respond);

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});
