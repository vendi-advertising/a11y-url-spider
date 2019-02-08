/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8, esversion: 8 */

const fs            = require('fs');
const puppeteer     = require('puppeteer');
const utils         = require('./src/utils');
const async_fs      = require('./src/async_fs');
const browser       = require('./src/browser');
const normalizeUrl  = require('normalize-url');
const parse         = require('url-parse');
const unique        = require('array-unique');
const jsonfile      = require('jsonfile');
const path          = require('path');
const endsWith      = require('ends-with');
const sha256        = require('sha256');

let
    depth = 6,
    main_domain,
    cache_file
;

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

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

async function worker(urls, master_list){

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
                            these_urls = await get_urls_on_single_page_as_array_of_strings(url),
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

async function get_urls_on_single_page_as_array_of_strings(url){
    const
        chrome_browser = await puppeteer.launch({defaultViewport: {width: 1280, height: 1024}}),
        page = await chrome_browser.newPage()
    ;

    let
        error_flag = false,
        unq = []
    ;

    // await page.setRequestInterception(true);

    // page
    //     .on(
    //         'request',
    //         (request) => {
    //             if (request.isNavigationRequest() && request.redirectChain().length){
    //                 request.abort();
    //             }else{
    //                 request.continue();
    //             }

    //         }
    //     )
    // ;

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

        unq = get_only_clean_urls(hrefs);

        await chrome_browser.close();
    }

    return unq;
};

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

function get_domain_file_name() {
    return sha256(main_domain);
}

function get_cache_abs_dir() {
    const
        hashed_domain = get_domain_file_name(main_domain),
        dir = path.resolve(__dirname, '.cache', hashed_domain)
    ;

    return dir;
}

function get_cache_abs_file_name_for_domain() {
    const
        dir = get_cache_abs_dir(main_domain),
        abs_file = path.resolve(dir, 'urls.json')
    ;

    fs
        .stat(
            dir,
            {},
            (err, stats) => {
                if (err) {
                    fs
                        .mkdir(
                            dir,
                            {
                                recursive: true,
                            },
                            (sub_err) => {
                                if (sub_err) {
                                    throw sub_err;
                                }
                            }
                        )
                    ;
                }
            }
        )
    ;

    return abs_file;
}

async function read_cahced_urls(urls) {
    try {
        const
            str = await async_fs.readFile(cache_file),
            data = JSON.parse(str)
        ;

        return data.urls;
    } catch (e) {
        return [];
    }
}

async function cache_urls(urls) {
    const
        data = {
            domain: main_domain,
            urls,
        },
        str = JSON.stringify(data)
    ;
    await async_fs.writeFile(cache_file, str);
}

async function get_only_clean_urls(urls){
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

async function get_report_for_url(url){
    console.debug('Running report for ' + url);

    const chrome_browser = await puppeteer.launch({defaultViewport: {width: 1280, height: 1024}});
    const page = await chrome_browser.newPage();
    await page.goto(url).catch((err) => {console.error(err);});
    await page.addScriptTag({path: path.resolve(__dirname, 'node_modules/axe-core/axe.min.js')});

    const ret = await page.evaluate(
                        async () => {
                            axe
                                .configure(
                                    {
                                        runOnly:
                                            {
                                                type: "tag",
                                                values: ["wcag2a", "wcag2aa"]
                                            }
                                    }
                            )
                            ;
                            return axe.run();
                        }
                    )
    ;

    await chrome_browser.close();

    return ret;
};

(async () => {

    const
        args = process.argv.slice(2)
    ;

    if(!args.length) {
        throw 'Please provide the url as the first argument';
    }

    const
        start_url = args.shift()
    ;


    main_domain = parse(start_url, true).hostname;
    cache_file = get_cache_abs_file_name_for_domain(main_domain);

    let
        i = 1,
        urls_to_process = await read_cahced_urls(),
        urls_already_processed = [],
        urls_just_processed
    ;

    if(!urls_to_process.length){
        urls_to_process = [start_url];
    }

    while(i <= depth){
        console.dir('At depth ' + i)

        //Grab new URLs
        urls_just_processed = await worker(urls_to_process, urls_already_processed);

        await cache_urls(urls_to_process);

        //Merge existing with newly found URLs back into the "done" array
        urls_already_processed = [...urls_already_processed, ...urls_to_process];

        //The next round should use all of the previously found URLs
        urls_to_process = urls_just_processed;
        i++;
    }

    const
        final_data = []
    ;

    await asyncForEach(
            urls_already_processed,
            async (url) => {
                const
                    report = await get_report_for_url(url)
                ;

                final_data
                    .push(
                        {
                            url,
                            report,
                        }
                    )
                ;
            }
        )
    ;

    const
        file = __dirname + '/reports/' + main_domain + '.json',
        data = {
            start_url,
            final_data,
        }
    ;

    jsonfile
        .writeFile(
            file,
            data,
            {spaces: 2},
            function(err) {
                console.error(err);
            }
    );

})();
