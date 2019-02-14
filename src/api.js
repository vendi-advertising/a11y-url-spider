/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

get_urls_to_spider = async (global_options) => {
    const
        fetch = require('node-fetch'),
        url = get_url_from_options(global_options, '/batch/request'),
        headers = {
            'X-AUTH-TOKEN': global_options.token,
        },
        agent = get_requestor(global_options),
        options = {
            headers,
            agent,
        },
        response = await fetch(url, options),
        json = await response.json(),
        urls = json.urls
    ;

    //For now we are always jamming Vendi back in since the API request pulls
    //the URL from the queue
    return [...urls];
};

send_url_report_to_server = async(global_options, report) => {
    const
        fetch = require('node-fetch'),
        url = get_url_from_options(global_options, '/batch/submit'),
        headers = {
            'X-AUTH-TOKEN': global_options.token,
        },
        agent = get_requestor(global_options),
        body = await JSON.stringify(report),
        options = {
            headers,
            agent,
            body,
            method: 'post',
        },
        response = await fetch(url, options)
    ;

    let
        response_body
    ;

    if(response.ok){
        response_body = await response.json();
        console.dir(response_body);
    }else{
        response_body = await response.text();
        console.dir(response_body);
        throw 'Error';
    }

    
    // console.dir(body);
};

get_url_from_options = (global_options, path) => {
    let
        url = 'http'
    ;

    if(global_options.secure){
        url += 's';
    }

    url += '://';

    url += global_options.host;

    if(80 !== global_options.port && 443 !== global_options.port){
        url += ':' + global_options.port;
    }

    url += '/api/v';

    url += global_options['api-version'];

    url += path;

    return url;
}

get_requestor = (global_options) => {
    if(global_options.secure){
        const
            https = require("https"),
            agent = new https.Agent(
                {
                    rejectUnauthorized: false
                }
            )
        ;

        return agent;
    }

    const
        http = require("http"),
        agent = new http.Agent()
    ;

    return agent;
}

module.exports.get_urls_to_spider = get_urls_to_spider;
module.exports.send_url_report_to_server = send_url_report_to_server;
