/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

const async_fs      = require('./async_fs');
const sha256        = require('sha256');
const path          = require('path');
const fs            = require('fs');

async function read_cahced_urls(cache_file) {
    try {
        const
            str = await async_fs.readFile(cache_file),
            data = JSON.parse(str)
        ;

        return data.urls;
    } catch (e) {
        return [];
    }
}

async function cache_urls(cache_file, urls) {
    const
        data = {
            urls,
        },
        str = JSON.stringify(data)
    ;
    await async_fs.writeFile(cache_file, str);
}

function get_domain_file_name(main_domain) {
    return sha256(main_domain);
}

function get_cache_abs_dir(main_domain) {
    const
        hashed_domain = get_domain_file_name(main_domain),
        dir = path.resolve(__dirname, '../.cache', hashed_domain)
    ;

    return dir;
}

function get_cache_abs_file_name_for_domain(main_domain) {
    const
        dir = get_cache_abs_dir(main_domain),
        abs_file = path.resolve(dir, 'urls.json')
    ;

    fs
        .stat(
            dir,
            {},
            (err, stats) => {
                if (err) {
                    fs
                        .mkdir(
                            dir,
                            {
                                recursive: true,
                            },
                            (sub_err) => {
                                if (sub_err) {
                                    throw sub_err;
                                }
                            }
                        )
                    ;
                }
            }
        )
    ;

    return abs_file;
}

module.exports.read_cahced_urls = read_cahced_urls;
module.exports.cache_urls = cache_urls;
module.exports.get_cache_abs_file_name_for_domain = get_cache_abs_file_name_for_domain;
