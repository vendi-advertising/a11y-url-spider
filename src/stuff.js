/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

const browser       = require('./browser');
const endsWith      = require('ends-with');
const fs            = require('fs');
const normalizeUrl  = require('normalize-url');
const parse         = require('url-parse');
const path          = require('path');
const puppeteer     = require('puppeteer');
const unique        = require('array-unique');
const utils         = require('./utils');

//Sorry for the stupid name, just need to organize things a bit!!!

function vendi_normalized_url(url)
{
    return normalizeUrl(
                url,
                {
                    normalizeHttp: true,
                    stripWWW: false,
                }
        );
}

function path_ends_with_bad_file_extension(path) {
    const
        bad = ['pdf','jpg','gif','png','docx','xlsx','doc','xls',],
        path_lc = path.toLowerCase()
    ;

    return bad
            .some(
                (ext) => {

                    return endsWith(path_lc, '.' + ext) ;

                }
            )
        ;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

async function worker(urls, main_domain, master_list){

    if(!Array.isArray(urls)){
        urls = [urls];
    }

    if(!master_list){
        master_list = [];
    }

    let
        ret = []
    ;

    const
        start = async() => {
            await asyncForEach(
                    urls,
                    async (url) => {
                        if(master_list.includes(url)){
                            return;
                        }

                        console.debug('Looking at ' + url);
                        const
                            these_urls = await get_urls_on_single_page_as_array_of_strings(url, main_domain),
                            merged = utils.merge_and_dedupe_arrays([ ret, these_urls ]),
                            unique_only = unique(merged)
                        ;

                        ret = unique_only;
                    }
                )
        }
    ;

    await start();

    return ret;
};

async function get_urls_on_single_page_as_array_of_strings(url, main_domain){
    const
        chrome_browser = await puppeteer.launch({defaultViewport: {width: 1280, height: 1024}}),
        page = await chrome_browser.newPage()
    ;

    let
        error_flag = false,
        unq = []
    ;

    await page
            .goto(url)
            .catch(
                (err) => {
                    console.error(err);
                    error_flag = true;
                }
            )
        ;

    if(!error_flag){

        const
            hrefs = await page.$$eval('a', as => as.map(a => a.href))
        ;

        unq = get_only_clean_urls(hrefs, main_domain);

        await chrome_browser.close();
    }

    return unq;
};

async function get_only_clean_urls(urls, main_domain){
    if(!Array.isArray(urls)){
        return [];
    }

    const
        http_only = urls
                        .filter(
                            (href) => {

                                const
                                    this_url_parts = parse(href, true)
                                ;

                                if(this_url_parts.protocol !== 'http:' && this_url_parts.protocol !== 'https:'){
                                    // console.log('not HTTP');
                                    return false;
                                }

                                if(main_domain !== this_url_parts.hostname){
                                    // console.log(this_url_parts.hostname);
                                    // console.log('not domain');
                                    return false;
                                }

                                if(path_ends_with_bad_file_extension(this_url_parts.pathname)){
                                    // console.log(this_url_parts.pathname);
                                    // console.log('bad extension');
                                    return false;
                                }

                                //I don't remember which site this was from
                                if(href.includes('external-redirect')){
                                    return false;
                                }

                                //Specific Domain/URL hacks
                                switch(this_url_parts.hostname){

                                    case 'www.stoptheclot.org':
                                        if(this_url_parts.pathname.includes('/curriculum')){
                                            return false;
                                        }

                                        break;

                                    case 'www.altra.org':

                                        if(this_url_parts.pathname.includes('/ebooks/')){
                                            return false;
                                        }

                                        if(this_url_parts.pathname.includes('~')){
                                            return false;
                                        }

                                        if(this_url_parts.pathname.includes('ai1ec_post_ids')){
                                            return false;
                                        }

                                        if(this_url_parts.pathname.includes('action=export_events')){
                                            return false;
                                        }

                                        break;

                                    case 'www.westerntc.edu':
                                        if(this_url_parts.pathname.includes('/presidents-list/')){
                                            return false;
                                        }

                                        if(this_url_parts.pathname.includes('/node/77/')){
                                            return false;
                                        }

                                        break;

                                }

                                return true;

                            }
                        )
                        .map(vendi_normalized_url),
        unique_only = unique(http_only)
    ;

    return unique_only;
};

module.exports.worker = worker;
