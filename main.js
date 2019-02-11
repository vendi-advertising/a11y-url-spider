/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8, esversion: 8 */

const parse         = require('url-parse');
const jsonfile      = require('jsonfile');
const cache         = require('./src/cache.js');
const stuff         = require('./src/stuff.js');

(async () => {

    const
        REQUIRED_NODE_VERSION_MAJOR = 11,
        args = process.argv.slice(2),
        version_string = process.version,
        version_parts = version_string.replace(/[^\d\.]/g, '').split('.'),
        version_major = version_parts.length >= 0 ? version_parts[0] : 0
    ;

    if(version_major < REQUIRED_NODE_VERSION_MAJOR){
        throw `Minimum of Node version ${REQUIRED_NODE_VERSION_MAJOR} is required`;
    }

    if(!args.length) {
        throw 'Please provide the url as the first argument';
    }

    const
        depth = 100,
        start_url = args.shift(),
        main_domain = parse(start_url, true).hostname,
        cache_file = cache.get_cache_abs_file_name_for_domain(main_domain)
    ;

    let
        i = 1,
        urls_to_process = await cache.read_cahced_urls(cache_file),
        urls_already_processed = [],
        urls_just_processed
    ;

    if(!urls_to_process.length){
        urls_to_process = [start_url];
    }

    while(i <= depth){
        console.dir('At depth ' + i)

        //Grab new URLs
        urls_just_processed = await stuff.worker(urls_to_process, main_domain, urls_already_processed);

        await cache.cache_urls(cache_file, urls_to_process);

        //Merge existing with newly found URLs back into the "done" array
        urls_already_processed = [...urls_already_processed, ...urls_to_process];

        //The next round should use all of the previously found URLs
        urls_to_process = urls_just_processed;
        i++;
    }

    const
        final_data = []
    ;

    await asyncForEach(
            urls_already_processed,
            async (url) => {
                const
                    report = await get_report_for_url(url)
                ;

                final_data
                    .push(
                        {
                            url,
                            report,
                        }
                    )
                ;
            }
        )
    ;

    const
        file = __dirname + '/reports/' + main_domain + '.json',
        data = {
            start_url,
            final_data,
        }
    ;

    jsonfile
        .writeFile(
            file,
            data,
            {spaces: 2},
            function(err) {
                console.error(err);
            }
    );

})();
