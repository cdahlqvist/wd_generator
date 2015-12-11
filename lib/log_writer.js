
var tcp_client = require('./tcp_client');
var util = require('./util');

var HOST = "127.0.0.1";
var RETRY_DELAY_MS = 10000;

module.exports.start_log_writer = function(state) {
    var conn_state = {
	    'available_connections': [],
	    'suspended_connections': [],
	    'state': state
    };

    for (var i = 0; i < state.logstash_ports.length; i++) {
        var port = state.logstash_ports[i];

        util.log('Connect log writer to port: %d', port);

        var tc = new tcp_client.TcpClient(HOST, port, RETRY_DELAY_MS);

        conn_state.available_connections.push(tc);
    }

    write_logs(conn_state);
}

function write_logs(conn_state) {
    if(conn_state.suspended_connections.length == 0 && conn_state.state.simulate_server_failure) {
        conn_state.suspended_connections.push(conn_state.available_connections.shift());

        var failure_duration = 1000 * util.getRandomInt(conn_state.state.server_failure_min_dur, conn_state.state.server_failure_max_dur);
        setTimeout(unsuspend, failure_duration, conn_state);
    }

    while(conn_state.state.queue.getLength() > 0) {
        var logline = conn_state.state.queue.dequeue();
        var c = conn_state.available_connections.shift();
        c.write_data(logline);
        conn_state.available_connections.push(c);
    }

	setTimeout(write_logs, 500, conn_state);
}

function unsuspend(conn_state) {
    conn_state.state.simulate_server_failure = false;

    for(var c = 0; c < conn_state.suspended_connections.length; c++) {
        conn_state.available_connections.push(conn_state.suspended_connections.shift());
    }
}
