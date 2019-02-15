/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

const browser       = require('./browser');
const fetch         = require('node-fetch');


//Sorry for the stupid name, just need to organize things a bit!!!

getUrlInfo = async (url) => {
    const
        ret = {
            url,
            contentType: null,
            statusCode: null,
            error: null,
        }
    ;

    try {

        const
            response = await fetch(url),
            body = await response.arrayBuffer(),
            bodyLength = body.byteLength
        ;

        ret.contentType = response.headers.get('content-type');
        ret.statusCode = response.status;
        ret.byteSize = bodyLength;
    } catch (error) {
        ret.error = error;
    }

    return ret;
};

isUrlHtml = (urlInfo) => {
    return urlInfo.contentType.includes('text/html') || urlInfo.contentType.includes('application/xhtml+xml');
}

async function worker(urls){

    const
        ret = []
    ;

    for await( const urlObj of urls ) {
        const
            url_info = await getUrlInfo(urlObj.url),
            is_html = isUrlHtml(url_info),
            subUrlRequestStatus = is_html ? await browser.get_urls_on_single_page_as_array_of_strings(urlObj.url) : [],
            result = {
                ...url_info,
                scanUrlId: urlObj.scanUrlId,
                subUrlRequestStatus,
            }
        ;

        ret.push(result);
    }

    return ret;
};

async function worker_a11y(urls){

    const
        ret = []
    ;

    for await( const urlObj of urls ) {
        const
            subUrlRequestStatus = await browser.get_report_for_url(urlObj.url),
            result = {
                scanUrlId: urlObj.scanUrlId,
                subUrlRequestStatus,
            }
        ;

        ret.push(result);
    }

    return ret;
};

module.exports.worker = worker;
module.exports.worker_a11y = worker_a11y;
