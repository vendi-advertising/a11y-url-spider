/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

import commandLineArgs from 'command-line-args';

export const test_node_version = (required_version) => {
    const
        version_string = process.version,
        version_parts = version_string.replace(/[^\d\.]/g, '').split('.'),
        version_major = version_parts.length >= 0 ? version_parts[0] : 0
    ;

    if(version_major < required_version){
        throw `Minimum of Node version ${required_version} is required`;
    }
}

export const get_and_validate_scanner_options = () => {
    const
        optionDefinitions = [
            { name: 'token', alias: 't'},
            { name: 'mode', alias: 'm' },
            { name: 'host', alias: 'h' },
            { name: 'port', alias: 'p', type: Number, defaultValue: 80 },
            { name: 'secure', alias: 's', type: Boolean, defaultValue: true },
            { name: 'api-version', alias: 'v', type: Number, defaultValue: 1 },
            { name: 'http-username' },
            { name: 'http-password' },
          ],
        global_options = commandLineArgs(optionDefinitions)
    ;

    if(!global_options.token){
        console.error('Please provide a value for the --token parameter');
        return null;
    }

    if(!global_options.host){
        console.error('Please provide a value for the --host parameter');
        return null;
    }

    if(!global_options.mode){
        console.error('Please provide a value for the --mode parameter, one of crawler or a11y');
        return null;
    }

    return global_options;
};
