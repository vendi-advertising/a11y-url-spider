/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

const normalizeUrl = require('normalize-url');
const endsWith      = require('ends-with');

merge_and_dedupe_arrays = (arr) => {
    //https://stackoverflow.com/a/27664971/231316
    return [...new Set([].concat(...arr))];
}

vendi_normalized_url = (url) => {
    return normalizeUrl(
                url,
                {
                    normalizeHttp: true,
                    stripWWW: true,
                }
        );
}

path_ends_with_bad_file_extension = (path) => {
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

asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

get_only_clean_urls = async(urls, main_domain) => {

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

                                if(utils.path_ends_with_bad_file_extension(this_url_parts.pathname)){
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
                        .map(utils.vendi_normalized_url),
        unique_only = unique(http_only)
    ;

    return unique_only;
}

module.exports.merge_and_dedupe_arrays = merge_and_dedupe_arrays;
module.exports.vendi_normalized_url = vendi_normalized_url;
module.exports.path_ends_with_bad_file_extension = path_ends_with_bad_file_extension;
module.exports.asyncForEach = asyncForEach;
module.exports.get_only_clean_urls = get_only_clean_urls;
