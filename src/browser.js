/*jslint esversion: 8, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

get_browser = async () => {
    const
        puppeteer = require('puppeteer'),
        utils = require('./utils'),
        chrome_browser = await puppeteer.launch({defaultViewport: {width: 1280, height: 1024}})
    ;

    return chrome_browser;
}

get_urls_on_single_page_as_array_of_strings = async(url) => {

    const
        chrome_browser = await get_browser(),
        page = await chrome_browser.newPage(),
        results = {
            status: 'unknown',
            error: null,
            urls: [],
        }
    ;

    await page
            .goto(url)
            .catch(
                (err) => {
                    results.status = 'error';
                    results.error = err;
                    console.error(err);
                }
            )
    ;

    if(results.error){
        await chrome_browser.close();
        return results;
    }

    //See if we'r not supposed to follow links on this page
    const
        meta = await page.$$('meta[name~=robots][content~=nofollow]')
    ;

    if(meta.length){
        results.status = 'page-no-follow';
        await chrome_browser.close();
        return results;
    }

    const
        unique = require('array-unique'),
        parse = require('url-parse'),
        main_domain = parse(url).hostname,
        elements = await page.$$('*')
        unique_urls = elements

                            //First get link-like things
                            .filter(
                                (element) => {
                                    return element.href || element.src;
                                }
                            )

                            //Next, make sure that we can follow them
                            .filter(
                                (element) => {
                                    return !element.rel && !element.rel.includes('nofollow');
                                }
                            )

                            //Now get either the actual URL
                            .map(
                                (element) => {
                                    return element.href || element.src;
                                }
                            )

                            //Get only HTTP(S) links (not mailto, etc.)
                            .filter(
                                (url) => {

                                    const
                                        url_parts = parse(url, true)
                                    ;

                                    if (url_parts.protocol !== 'http:' && url_parts.protocol !== 'https:') {
                                        return false;
                                    }

                                    if (main_domain !== url_parts.hostname) {
                                        return false;
                                    }

                                    return true;

                                }
                            )

                            //Remove duplicates, see https://stackoverflow.com/a/14438954/231316
                            .filter(
                                (url, idx, self) => {
                                    return self.indexOf(url) === idx;
                                }
                            )
    ;

    results.urls = unique_urls;
    await chrome_browser.close();

    return results;
};

get_report_for_url = async(url) => {
    console.debug('Running report for ' + url);

    const puppeteer = require('puppeteer');
    const path = require('path');

    const chrome_browser = await puppeteer.launch({defaultViewport: {width: 1280, height: 1024}});
    const page = await chrome_browser.newPage();

    let ret;

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

        return ret;
    } catch (e) {
        const
            ret = {
                error: e
            }
        ;
        return ret;
    } finally {
        await chrome_browser.close();
    }
};

export const get_urls_on_single_page_as_array_of_strings = get_urls_on_single_page_as_array_of_strings;
export const get_report_for_url = get_report_for_url;
