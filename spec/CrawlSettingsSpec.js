import CrawlSettings from '../src/CrawlSettings.js';

describe("CrawlSettings", function () {

    it('works', () => {

        expect((new CrawlSettings()).getHostNames()).toEqual(CrawlSettings.getDefaultHostNames());
        expect((new CrawlSettings()).getProtocols()).toEqual(CrawlSettings.getDefaultProtocols());

        expect((new CrawlSettings()).withHostNames('example.com', 'www.example.com').getHostNames().sort()).toEqual(['example.com', 'www.example.com'].sort());
        expect((new CrawlSettings()).withHostNames('example.com', 'www.example.com').getHostNames().sort()).toEqual(['www.example.com', 'example.com'].sort());
        expect((new CrawlSettings()).withHostNames('www.example.com').getHostNames()).toEqual(['www.example.com']);

        expect((new CrawlSettings()).withProtocols(CrawlSettings.PROTOCOL_HTTP).getProtocols()).toEqual([CrawlSettings.PROTOCOL_HTTP]);



        // console.dir(CrawlSettings()._enforceStringOrArrayOfStrings('', 'string'));
        // console.dir(CrawlSettings()._enforceStringOrArrayOfStrings('', 'string', 'string'));
        // console.dir(CrawlSettings()._enforceStringOrArrayOfStrings('', ['string', 'string']));

        // console.dir(cs);

        // expect(Array.isArray(results)).toBe(true);
        // expect(results.length).toBe(4);
        // expect(results).toEqual([
        //     `${secure_protocol}${good_domain}${common_page}`,
        //     `${secure_protocol}${good_domain}/people`,
        //     `${secure_protocol}${good_domain}/image.jpg`,
        //     `${secure_protocol}${good_domain}/cheese`
        // ]);
    });

});
