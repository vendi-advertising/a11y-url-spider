/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

const normalizeUrl = require('normalize-url');

module.exports = {
    merge_and_dedupe_arrays: function(arr)
    {
        //https://stackoverflow.com/a/27664971/231316
        return [...new Set([].concat(...arr))];
    },
    vendi_normalized_url: function(url)
    {
        return normalizeUrl(
                    url,
                    {
                        normalizeHttp: true,
                        stripWWW: true,
                    }
            );
    }
}
