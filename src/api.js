/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

get_urls_to_spider = async (global_options) => {
    const
        fetch = require('node-fetch'),
        url = get_url_from_options(global_options, 'get'),
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
        urls = json.urls || []
    ;

    //For now we are always jamming Vendi back in since the API request pulls
    //the URL from the queue
    return [...urls];
};

send_url_report_to_server = async(global_options, report) => {
    const
        fetch = require('node-fetch'),
        url = get_url_from_options(global_options, 'submit'),
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
        }
    ;

    console.log('Submitting to URL: ' + url);

    const
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

get_url_from_options = (global_options, direction) => {
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

    switch(global_options.mode){
        case 'crawler':
            url += '/scanner/crawler';
            break;

        case 'a11y':
            url += '/scanner/a11y';
            break;

        default:
            throw 'Unknown mode: ' + global_options.mode;
    }

    switch(direction){
        case 'get':
            url += '/get';
            break;

        case 'submit':
            url += '/send';
            break;

        default:
            throw 'Unknown direction: ' + direction;
    }

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
