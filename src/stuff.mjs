/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

import { is_url_html } from './utils';

//Sorry for the stupid name, just need to organize things a bit!!!

export const getUrlInfo = async (url) => {
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

const isUrlHtml = (urlInfo) => {
    return is_url_html(urlInfo);
}

export const worker = async (urls) => {

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

export const worker_a11y = async (urls) => {

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
