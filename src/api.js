/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

get_urls_to_spider = async (token) => {
    const
        fetch = require('node-fetch'),
        https = require("https"),
        url = 'https://127.0.0.1:8000/api/v1/batch/request',
        headers = {
            'X-AUTH-TOKEN': token,
        },
        agent = new https.Agent(
            {
                rejectUnauthorized: false
            }
        ),
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
    return [...urls, {url: 'https://vendiadvertising.com/', propertyScanUrlId: 1,}];
};

send_url_report_to_server = async(token, report) => {
    const
        fetch = require('node-fetch'),
        https = require("https"),
        url = 'https://127.0.0.1:8000/api/v1/batch/submit',
        headers = {
            'X-AUTH-TOKEN': token,
        },
        agent = new https.Agent(
            {
                rejectUnauthorized: false
            }
        ),
        body = await JSON.stringify(report),
        options = {
            headers,
            agent,
            body,
            method: 'post',
            // headers: { 'Content-Type': 'application/json' },
        },
        response = await fetch(url, options),
        json = await response.body
    ;

    console.dir(json);
    // console.dir(body);
};

module.exports.get_urls_to_spider = get_urls_to_spider;
module.exports.send_url_report_to_server = send_url_report_to_server;
