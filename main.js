/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8, esversion: 8 */

const api           = require('./src/api.js');
const stuff         = require('./src/stuff.js');
const settings      = require('./src/settings.js');


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

let
    task_lock = false
;

const
    CronJob = require('cron').CronJob,
    task = new CronJob(
            '*/5 * * * * *',
            async () => {

                if(task_lock){
                    return;
                }

                try{

                    task_lock = true;

                    const
                        urls = await api.get_urls_to_spider(global_options)
                    ;

                    switch(global_options.mode){
                        case 'crawler':

                            const
                                results = await stuff.worker(urls)
                            ;

                            if(urls.length){
                                await api.send_url_report_to_server(global_options, results);
                            }

                            break;
                        
                        case 'a11y':
                            const
                                results_a = await stuff.worker_a11y(urls)
                            ;

                            console.dir(results_a);
                        

                            break;
                        
                        default:
                            throw 'Unknown mode: ' + global_options.mode;

                    }

                    task_lock = false;
                } catch(error){
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