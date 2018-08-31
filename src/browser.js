/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

const utils = require('./utils');
const sha1 = require('sha1');

async function get_screenshot(page, dir_root)
{
    const
        url = page.url(),
        normalized_url = utils.vendi_normalized_url(url),
        file_name = sha1(normalized_url) + '.png'
    ;
    await page.screenshot({path: dir_root + '/screenshots/' + file_name, fullPage: true});
}

module.exports.get_screenshot = get_screenshot;
