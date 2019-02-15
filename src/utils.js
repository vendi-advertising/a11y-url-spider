/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

const normalizeUrl = require('normalize-url');
const endsWith      = require('ends-with');
const parse         = require('url-parse');
const unique        = require('array-unique');

vendi_normalized_url = (url) => {
    return normalizeUrl(
                url,
                {
                    normalizeHttp: true,
                    stripWWW: false,
                }
        );
}

get_only_clean_urls = async(urls, main_domain) => {

    if(!Array.isArray(urls)){
        return [];
    }

    const
        http_only = urls
                        .filter(
                            (href) => {

                                if(!href){
                                    return false;
                                }

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

                                return true;

                            }
                        )
                        .map(vendi_normalized_url),
        unique_only = unique(http_only)
    ;

    return unique_only;
}

module.exports.get_only_clean_urls = get_only_clean_urls;
