
var restify = require('restify');
var util = require('./util');
var state = require('./config');
var queue = require('./queue');

state.cfg = require('../reference_data/config.json');

state.queue = new queue.Queue();
state.simulate_server_failure = false;
state.initiate_vulnerability_scan = false;
state.initiate_dead_link = false;
state.dead_urls = [];

var log_writer = require('./log_writer');
log_writer.start_log_writer(state);

var session_generator = require('./session_generator');
session_generator.start_session_generation(state);

// Handle web requests
var server = restify.createServer();

server.get('/server_failure', function(req, res, next) {
    if(state.simulate_server_failure) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write("{'result':'error','reason':'Server failure already initiated.'}\n");
        res.end();
    } else {
    	state.simulate_server_failure = true;
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write("{'result':'ok'}\n");
        res.end();
    }
});
server.get('/exploit', function(req, res, next) {
    if(state.initiate_vulnerability_scan) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write("{'result':'error','reason':'Exploit already being initiated.'}\n");
        res.end();
    } else {
    	state.initiate_vulnerability_scan = true;
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write("{'result':'ok'}\n");
        res.end();
    }
});
server.get('/dead_url', function(req, res, next) {
    if(state.initiate_dead_link) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write("{'result':'error','reason':'Dead link already being initiated.'}\n");
        res.end();
    } else {
    	state.initiate_dead_link = true;
    	res.writeHead(200, {"Content-Type": "application/json"});
        res.write("{'result':'ok'}\n");
        res.end();
    }
});

server.listen(state.http_port, function() {
    console.log('Listening on port: ' + state.http_port);
});

