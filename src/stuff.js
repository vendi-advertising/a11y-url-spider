/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

const browser       = require('./browser');
const fs            = require('fs');
const parse         = require('url-parse');
const path          = require('path');
const puppeteer     = require('puppeteer');
const unique        = require('array-unique');
const utils         = require('./utils');
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
            response = await fetch(url)
        ;

        ret.contentType = response.headers.get('content-type');
        ret.statusCode = response.status;
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
                propertyScanUrlId: urlObj.propertyScanUrlId,
                subUrlRequestStatus,
            }
        ;

        ret.push(result);
    }

    return ret;
};

module.exports.worker = worker;
