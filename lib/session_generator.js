
var util = require('./util');

module.exports.start_session_generation = function(state) {
    setTimeout(function process_session_generation(state) {
        var hour = util.get_utc_hour_of_day();

        // Check if new session should be generated
        var reqs = state.cfg.requests_per_hour[hour];
        var rnd = util.getRandomInt(0, state.session_generation_range);

        if(rnd < reqs) {
            var country = util.random_entry_from_probability_hash(state.cfg.country_hours[hour]);
            var ip = randomize_ip(util.random_list_entry(state.cfg.country_ips[country]));
            var referer = util.random_list_entry(state.cfg.referers);
            var session = util.random_list_entry(state.cfg.sessions);
            var user_agent = util.random_list_entry(state.cfg.user_agents);

            if(state.initiate_dead_link) {
            	state.dead_urls.push(create_dead_url());
            	state.initiate_dead_link = false;

            	setTimeout(clear_dead_url, 1000 * state.dead_url_dur, state);
            }

            if(Math.random() < state.dead_url_probability) {
                execute_session(state, session, 0, ip, referer, user_agent, state.dead_urls);
            } else {
                execute_session(state, session, 0, ip, referer, user_agent, []);
            }
        }

        // Check if we should initiale any exploit session
        if(state.initiate_vulnerability_scan) {
            state.initiate_vulnerability_scan = false;

            var url_count = util.getRandomInt(100, 300);
            var exploit_array = [];
            
            for(var i = 0; i < url_count; i++) {
                exploit_array.push(util.random_list_entry(state.cfg.exploit_urls));
            }

            exploit_array = util.uniq(exploit_array);
            var country = util.random_entry_from_probability_hash(state.cfg.country_hours[hour]);
            var ip = randomize_ip(util.random_list_entry(state.cfg.country_ips[country]));
            execute_exploit_session(state, exploit_array, ip);
        }

        setTimeout(process_session_generation, 1000, state);
    }, 1000, state);
}

function execute_session(state, session, session_index, ip, referer, user_agent, dead_urls) {
    var ts = session[session_index].offset;
    var delay = 1000;
    var next_session_index = session_index;
    for(var k = session_index; k < session.length; k++) {
        if(session[k].offset == ts) {
            state.queue.enqueue(format_log_string(ip, state.cfg.urls[session[k].url], session[k].response, session[k].size, referer, user_agent));
            next_session_index++;
        } else {
            delay = 1000 * (session[k].offset - ts);
            break;
        }
    }

    for (var du = 0; du < dead_urls.length; du++) {
        state.queue.enqueue(format_log_string(ip, dead_urls[du].url, "404", dead_urls[du].bytes, referer, user_agent));
    }

    if(next_session_index < session.length) {
        setTimeout(execute_session, delay, state, session, next_session_index, ip, referer, user_agent, []);
    }
}

function execute_exploit_session(state, exploit_urls, ip) {
    var url_count = Math.min(util.getRandomInt(1,3), exploit_urls.length);

    for(var i = 0; i < url_count; i++) {
        var url = exploit_urls.shift();
        state.queue.enqueue(format_log_string(ip, url, "404", util.getRandomInt(150,300), "-", "-"))
    }
    
    if(exploit_urls.length > 0) {
        setTimeout(execute_exploit_session, 1000, state, exploit_urls, ip);
    }
}

function create_dead_url() {
    var id = util.getRandomInt(1000000,99999999);

    var http = " HTTP/1.1";
    if(Math.random() < 0.3) {
    	http = " HTTP/1.0";
    }

    var ext = ".jpg";
    if(Math.random() < 0.4) {
    	ext = ".gif";
    }

    var du = {};
    du.url = "GET /" + id + ext + http;
    du.bytes = util.getRandomInt(150,250);

    return du;
}

function clear_dead_url(state) {
    state.dead_urls.shift();
}

function format_log_string(ip, url, response_code, size, referer, agent) {
	return ip + " - - [" + util.get_utc_log_timestamp() + "] \"" + url + "\" " + response_code + " " + size + " \"" + referer + "\" \"" + agent + "\"\n";
}

function randomize_ip(base_ip) {
    return base_ip + "." + util.getRandomInt(0,255) + "." + util.getRandomInt(0,255);
}
