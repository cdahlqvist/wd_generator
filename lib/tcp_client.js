
var net = require('net');
var util = require('./util');

function TcpClient(host, portnum, retry_interval_ms) {
  this.state = {
  	  "client": null,
  	  "shost": host,
      "portnum": portnum,
      "retry_interval": retry_interval_ms,
      "is_connected": false
  };

  connect(this.state);

  return this;
}

TcpClient.prototype.is_connected = function() {
    return this.state.is_connected;
}

TcpClient.prototype.write_data = function(data) {
  if(!this.is_connected) {
  	  return false;
  }

  this.state.client.write(data);

  return true;
}

function connect(obj) {
    var client = new net.Socket();
 
    client.connect(obj.portnum, obj.shost, function() {
        util.log("Connected to %s:%d.", obj.shost, obj.portnum);
        obj.is_connected = true;
    });

    client.on('error', function(e) {
        if(e.code == 'ECONNREFUSED') {
            obj.client.destroy();
            obj.is_connected = false;
        };  
    });

    client.on('close', function() {
        util.log("Connection to %s:%d closed. Reconnecting...", obj.shost, obj.portnum);
        obj.is_connected = false;

        setTimeout(connect, obj.retry_interval, obj);
    });

    obj.client = client;

    return;    
}

module.exports.TcpClient = TcpClient;
