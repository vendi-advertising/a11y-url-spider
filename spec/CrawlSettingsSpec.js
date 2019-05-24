import CrawlSettings from '../src/CrawlSettings';

describe("CrawlSettings", function () {

    it('works', () => {

        expect((new CrawlSettings()).getHostNames()).toEqual(CrawlSettings.getDefaultHostNames());
        expect((new CrawlSettings()).getProtocols()).toEqual(CrawlSettings.getDefaultProtocols());

        expect((new CrawlSettings()).withHostNames('example.com', 'www.example.com').getHostNames().sort()).toEqual(['example.com', 'www.example.com'].sort());
        expect((new CrawlSettings()).withHostNames('example.com', 'www.example.com').getHostNames().sort()).toEqual(['www.example.com', 'example.com'].sort());
        expect((new CrawlSettings()).withHostNames('www.example.com').getHostNames()).toEqual(['www.example.com']);

        expect((new CrawlSettings()).withProtocols(CrawlSettings.PROTOCOL_HTTP).getProtocols()).toEqual([CrawlSettings.PROTOCOL_HTTP]);

    });

});
