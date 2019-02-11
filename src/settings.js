/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8 */

test_node_version = (required_version) => {
    const
        version_string = process.version,
        version_parts = version_string.replace(/[^\d\.]/g, '').split('.'),
        version_major = version_parts.length >= 0 ? version_parts[0] : 0
    ;

    if(version_major < required_version){
        throw `Minimum of Node version ${required_version} is required`;
    }
}

get_scanner_token = () => {
    const
        args = process.argv.slice(2)
    ;

    if(!args.length) {
        throw 'Please provide the scanner token as the first argument';
    }

    return args.shift();
}

module.exports.test_node_version = test_node_version;
module.exports.get_scanner_token = get_scanner_token;
