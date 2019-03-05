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

        try {
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
        } catch (e) {
            results.error = e;
            console.error(e);
        } finally {
            await chrome_browser.close();
        }
    }

    return results;
};

get_report_for_url = async(url) => {
    console.debug('Running report for ' + url);

    const puppeteer = require('puppeteer');
    const path = require('path');

    const chrome_browser = await puppeteer.launch({defaultViewport: {width: 1280, height: 1024}});
    const page = await chrome_browser.newPage();

    try {
        await page.goto(url).catch((err) => {console.error(err);});
        await page.addScriptTag({path: path.resolve(__dirname, '../node_modules/axe-core/axe.min.js')});
    
        const ret = await page.evaluate(
                            async () => {
                                axe
                                    .configure(
                                        {
                                            // runOnly:
                                            //     {
                                            //         type: "tag",
                                            //         values: ["wcag2a", "wcag2aa"]
                                            //     }
                                        }
                                )
                                ;
                                return axe.run();
                            }
                        )
        ;
    } catch (e) {
        ret = {error: e};
    } finally {
        await chrome_browser.close();
    }

    return ret;
};

module.exports.get_urls_on_single_page_as_array_of_strings = get_urls_on_single_page_as_array_of_strings;
module.exports.get_report_for_url = get_report_for_url;