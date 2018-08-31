/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

const puppeteer    = require('puppeteer');
const utils        = require('./src/utils');
const browser      = require('./src/browser');
const normalizeUrl = require('normalize-url');
const parse        = require('url-parse');
const unique       = require('array-unique');
const jsonfile     = require('jsonfile');
const path         = require('path');

const
    start_url = 'https://www.vendiadvertising.com/',
    main_domain = parse(start_url, true).hostname
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
                        console.debug('Looking at ' + url);
                        if(master_list.includes(url)){
                            return;
                        }
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
    const chrome_browser = await puppeteer.launch({defaultViewport: {width: 1280, height: 1024}});
    const page = await chrome_browser.newPage();
    await page.goto(url).catch((err) => {console.error(err);});
    const
        hrefs = await page.$$eval('a', as => as.map(a => a.href)),
        unq = get_only_clean_urls(hrefs)
    ;

    await chrome_browser.close();

    return unq;
};

async function get_only_clean_urls(urls){
    if(!Array.isArray(urls)){
        return [];
    }

    const
        http_only = urls
                        .filter(
                            (href) => {
                                return 0 === href.indexOf('http');
                            }
                        )
                        .filter(
                            (href) => {
                                return main_domain === parse(href, true).hostname
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

    let
        i = 1,
        urls_to_process = [start_url],
        urls_already_processed = [],
        urls_just_processed
    ;

    while(i <= 10){
        console.dir('At depth ' + i)
        urls_just_processed = await worker(urls_to_process, urls_already_processed);
        urls_already_processed = [...urls_to_process];
        urls_to_process = urls_just_processed;
        i++;
    }

    const
        final_data = []
    ;

    // urls_just_processed = [start_url];

    await asyncForEach(
            urls_just_processed,
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

    console.dir(final_data);

    const
        file = __dirname + '/' + main_domain + '.json',
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
