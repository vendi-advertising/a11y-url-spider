require ('../src/utils');

describe("Utils", function () {

    it('filters, maps and uniqifies', () => {
        const
            good_domain = 'www.example.com',
            bad_domain = 'www.example.net',
            common_page = '/about-us',
            secure_protocol = 'https://',
            insecure_protocol = 'http://',
            page_url = `${secure_protocol}${good_domain}`,
            elements = [

                //Valid
                { href: `${secure_protocol}${good_domain}${common_page}`, },
                { href: `${insecure_protocol}${good_domain}/people`, },                 //Different protocol (but will be automatically converted)
                { src:  `${secure_protocol}${good_domain}/image.jpg`, },                //An image src
                { href: `${secure_protocol}${good_domain}/cheese`, rel: 'follow' },     //Rel don't care

                //Invalid/duplicates
                { href: `${secure_protocol}${good_domain}${common_page}`, },            //Duplicate
                { href: `${insecure_protocol}${good_domain}${common_page}`, },          //Duplicate but with different protocol
                { href: `${secure_protocol}${bad_domain}${common_page}`, },             //Different domain
                { link: `${secure_protocol}${good_domain}${common_page}`, },            //Not an href/src
                { href: `mailto:test@example.com`, },                                   //Email
                { href: `${common_page}`, },                                            //No domain (shouldn't ever happen)
                { href: `${secure_protocol}${good_domain}/contact`, rel: 'nofollow'},   //No follow
            ],
            results = get_unique_urls_from_all_page_elements(page_url, elements)
        ;

        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(4);
        expect(results).toEqual([
            `${secure_protocol}${good_domain}${common_page}`,
            `${secure_protocol}${good_domain}/people`,
            `${secure_protocol}${good_domain}/image.jpg`,
            `${secure_protocol}${good_domain}/cheese`
        ]);
    });

});

// get_unique_urls_from_all_page_elements
