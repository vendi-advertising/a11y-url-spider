import { enforce_string_or_array_of_strings } from '../src/utils';

export default class CrawlSettings{

    static get PROTOCOL_HTTP() { return 'http:'; }
    static get PROTOCOL_HTTPS() { return 'https:'; }

    constructor() {
        this.hostNames = CrawlSettings.getDefaultHostNames();
        this.protocols = CrawlSettings.getDefaultProtocols();
    }

    static getDefaultHostNames() {
        return [];
    }

    static getDefaultProtocols() {
        return [CrawlSettings.PROTOCOL_HTTP, CrawlSettings.PROTOCOL_HTTPS];
    }

    getHostNames() {
        return this.hostNames;
    }

    setHostNames(...hostNames) {
        this.hostNames = enforce_string_or_array_of_strings('setHostNames', ...hostNames);
    }

    withHostNames(...hostNames) {
        this.setHostNames(hostNames);
        return this;
    }

    getProtocols() {
        return this.protocols;
    }

    setProtocols(...protocols) {
        this.protocols = enforce_string_or_array_of_strings('setProtocols', ...protocols);
    }

    withProtocols(...protocols) {
        this.setProtocols(protocols);
        return this;
    }
}
