/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

get_unique_urls_from_all_page_elements = (page_url, elements) => {

    const
        parse = require('url-parse'),
        main_domain = parse(page_url).hostname,
    ;

    return elements

                //First get link-like things
                .filter( element => element.href || element.src )

                //Next, make sure that we can follow them
                .filter( element => !element.rel && !element.rel.includes('nofollow') )

                //Now get either the actual URL
                .map( element => element.href || element.src )

                //Get only HTTP(S) links (not mailto, etc.)
                .filter(
                    (single_url) => {

                        const
                            url_parts = parse(single_url, true)
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
                .filter( (single_url, idx, self) => self.indexOf(single_url) === idx )
    ;
}

export const get_unique_urls_from_all_page_elements = get_unique_urls_from_all_page_elements;
