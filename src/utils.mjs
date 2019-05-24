/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

export const enforce_string_or_array_of_strings = (func, ...arg) => {
    //arg is passed in as a rest parameter, so it is always an array and is by
    //language definition, guaranteed to contain at least the empty array.

    //Test if the first item in the array is a sub-array, which means we were
    //not given the parameters in a variadic fashion but instead as a single array.
    if (Array.isArray(arg[0])) {

        //It is technically possible for someone to variadically give us multiple
        //arrays, however we don't support that, so fail loudly here.
        //This tests for `enforce_string_or_array_of_strings(func, [alpha, beta], [alpha])`
        if (arg.length > 1) {
            throw `Argument to ${func} must be a string or array of strings, multi-dimensional array provided.`;
        }

        //Unpack the first item in and send it to our main function
        arg = arg[0];
    }

    //This tests for `enforce_string_or_array_of_strings(func)`
    if (0 === arg.length) {
        throw `Argument to ${func} must be a string or array of strings, nothing provided.`;
    }

    //Run through each item. Valid strings just pass through, everything else throws
    return arg
        .map(
            (item) => {

                //String are good
                if (typeof item === 'string') {

                    //Make sure they are not empty
                    if (!item.trim()) {
                        //This tests for `enforce_string_or_array_of_strings(func, [''])`
                        throw `Argument to ${func} must be a string or array of strings, array with empty string provided.`;
                    }

                    return item;
                }

                //This tests for `enforce_string_or_array_of_strings(func, 5)`
                throw `Argument to ${func} must be a string or array of strings, ${typeof item} provided.`;

            }
        )
        ;
}

export const get_unique_urls_from_all_page_elements = (page_url, elements) => {

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
};

export const is_url_html = (url_info = {}) => {
    return url_info.contentType && (url_info.contentType.includes('text/html') || url_info.contentType.includes('application/xhtml+xml'));
}
