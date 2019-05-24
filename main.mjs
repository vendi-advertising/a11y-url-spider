/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8, esversion: 8 */

import { get_urls_to_spider, send_url_report_to_server} from './src/api';
import { worker, worker_a11y } from './src/stuff';
import { test_node_version, get_and_validate_scanner_options } from './src/settings';
import cron from 'cron';

(() => {

    const
        REQUIRED_NODE_VERSION_MAJOR = 11
    ;

    test_node_version(REQUIRED_NODE_VERSION_MAJOR);

    const
        global_options = get_and_validate_scanner_options()
    ;

    if (!global_options) {
        return;
    }

    let
        task_lock = false
        ;

    const
        // CronJob = require('cron').CronJob,
        task = new cron.CronJob(
            '*/5 * * * * *',
            async () => {

                if (task_lock) {
                    return;
                }

                try {

                    task_lock = true;

                    const
                        urls = await get_urls_to_spider(global_options)
                        ;

                    let
                        results
                        ;

                    switch (global_options.mode) {
                        case 'crawler':
                            results = await worker(urls);
                            break;

                        case 'a11y':
                            results = await worker_a11y(urls);
                            break;

                        default:
                            throw 'Unknown mode: ' + global_options.mode;
                    }


                    if (urls.length) {
                        await send_url_report_to_server(global_options, results);
                    }


                    task_lock = false;
                } catch (error) {
                    console.error(error);
                    throw error;
                }

            },
            null,
            true,
            'America/Chicago'
        )
        ;

    task.start();

})();
