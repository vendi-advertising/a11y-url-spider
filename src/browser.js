/*jslint esversion: 8, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

get_urls_on_single_page_as_array_of_strings = async(url) => {

    const
        puppeteer = require('puppeteer'),
        utils = require('./utils'),
        chrome_browser = await puppeteer.launch({defaultViewport: {width: 1280, height: 1024}}),
        page = await chrome_browser.newPage(),
        results = {
            error: null,
            urls: [],
        }
    ;

    let
        error_flag = false,
        unq = []
    ;

    await page
            .goto(url)
            .catch(
                (err) => {
                    results.error = err;
                    console.error(err);
                }
            )
        ;

    if(!results.error){

        const
            hrefs = await page.$$eval(
                '*',
                (as) => {
                    return as.map(
                        (a) => {

                            if(a.href){
                                return a.href;
                            }

                            if(a.src){
                                return a.src;
                            }

                            return '';
                        }
                    );
                }
            ),
            parse = require('url-parse'),
            main_domain = parse(url).hostname
        ;

        results.urls = await utils.get_only_clean_urls(hrefs, main_domain);

        await chrome_browser.close();
    }

    return results;
};

module.exports.get_urls_on_single_page_as_array_of_strings = get_urls_on_single_page_as_array_of_strings;
