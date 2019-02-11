/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8, esversion: 8 */

const api           = require('./src/api.js');
const cache         = require('./src/cache.js');
const jsonfile      = require('jsonfile');
const parse         = require('url-parse');
const stuff         = require('./src/stuff.js');
const settings      = require('./src/settings.js');

(async () => {

    const
        REQUIRED_NODE_VERSION_MAJOR = 11
    ;

    settings.test_node_version(REQUIRED_NODE_VERSION_MAJOR);

    const
        token = settings.get_scanner_token(),
        urls = await api.get_urls_to_spider(token),
        results = await stuff.worker(urls)
    ;

    await api.send_url_report_to_server(token, results);

    // console.dir( results );

})();
