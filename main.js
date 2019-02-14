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
        global_options = settings.get_and_validate_scanner_options()
    ;

    if(!global_options){
        return;
    }

    const
        urls = await api.get_urls_to_spider(global_options),
        results = await stuff.worker(urls)
    ;

    await api.send_url_report_to_server(global_options, results);

    // console.dir( results );

})();
