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

    console.dir(ret);

    return ret;
};

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
            await utils.asyncForEach(
                    urls,
                    async (url) => {

                        if(master_list.includes(url)){
                            return;
                        }

                        console.debug('Looking at ' + url);

                        const
                            url_info = await getUrlInfo(url),
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

        unq = utils.get_only_clean_urls(hrefs, main_domain);

        await chrome_browser.close();
    }

    return unq;
};

module.exports.worker = worker;
