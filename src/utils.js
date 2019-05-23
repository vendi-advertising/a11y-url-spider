/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

get_unique_urls_from_all_page_elements = (page_url, elements) => {

    const
        parse = require('url-parse'),
        main_domain = parse(page_url).hostname,
        main_protocol = parse(page_url).protocol
    ;

    return elements

                //First get link-like things
                .filter( element => element.href || element.src )

                //Next, make sure that we can follow them
                .filter( element => !element.rel || !element.rel.includes('nofollow') )

                //Now get either the actual URL
                .map( element => element.href || element.src )

                //Get only HTTP(S) links (not mailto, etc.)
                .filter( single_url => ['http:', 'https:'].includes( parse(single_url).protocol ) )

                //Check the domain
                .filter( single_url => main_domain === parse(single_url).hostname )

                //Assume same protocol as primary URL
                .map( single_url => parse(single_url, true).set('protocol', main_protocol).toString() )

                //Remove duplicates, see https://stackoverflow.com/a/14438954/231316
                .filter( (single_url, idx, self) => self.indexOf(single_url) === idx )
    ;
}

module.exports.get_unique_urls_from_all_page_elements = get_unique_urls_from_all_page_elements;
