/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

const normalizeUrl = require('normalize-url');
const endsWith      = require('ends-with');
const parse         = require('url-parse');
const unique        = require('array-unique');

merge_and_dedupe_arrays = (arr) => {
    //https://stackoverflow.com/a/27664971/231316
    return [...new Set([].concat(...arr))];
}

vendi_normalized_url = (url) => {
    return normalizeUrl(
                url,
                {
                    normalizeHttp: true,
                    stripWWW: false,
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

module.exports.merge_and_dedupe_arrays = merge_and_dedupe_arrays;
module.exports.vendi_normalized_url = vendi_normalized_url;
module.exports.path_ends_with_bad_file_extension = path_ends_with_bad_file_extension;
module.exports.asyncForEach = asyncForEach;
module.exports.get_only_clean_urls = get_only_clean_urls;
