
var utiljs = require('util');

var months = {
	"0":  "Jan",
	"1":  "Feb",
	"2":  "Mar",
	"3":  "Apr",
	"4":  "May",
	"5":  "Jun",
	"6":  "Jul",
	"7":  "Aug",
	"8":  "Sep",
	"9":  "Oct",
	"10": "Nov",
	"11": "Dec"
}

module.exports.get_utc_log_timestamp = function() {
    var d = new Date();
    var date_string = pad(d.getUTCDate(), 2) + "/" + 
                      months[d.getUTCMonth()] + "/" + 
                      d.getUTCFullYear() + ":" + 
                      pad(d.getUTCHours(), 2) + ":" +
                      pad(d.getUTCMinutes(), 2) + ":" +
                      pad(d.getUTCSeconds(), 2) + " +0000";

  return date_string;
}

module.exports.get_utc_hour_of_day = function() {
    var d = new Date();
    return d.getUTCHours();
}

module.exports.random_entry_from_probability_hash = function(prob_hash) {
  var rnd = Math.random();
  var sum = 0.0;
  var key;

  for (var key in prob_hash){
      sum += prob_hash[key];
      if(sum > rnd) {
      	  return key;
      }
  }

  return key;
}

module.exports.random_list_entry = function(list) {
    return list[Math.floor(Math.random()*list.length)];
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

module.exports.log = function() {
    var str = utiljs.format.apply(null, arguments);
    var d = new Date();
    console.log(d.toISOString() + ' ' + str);

    return;
}

module.exports.get_iso_timestamp = function() {
    var d = new Date();
    return d.toISOString();
}

module.exports.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.uniq = function (a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}
