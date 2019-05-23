require ('../src/utils');

describe("Utils", function () {

    it('filters, maps and uniqifies', () => {
        const
            page_url = 'https://www.example.com',
            elements = [
                { href: 'https://www.example.com/about-us', },
                { href: 'https://www.example.com/about-us', },  //Duplicate
                { src:  'https://www.example.com/image.jpg', }, //An image src
                { href: 'https://www.example.net/about-us', },  //Different domain
                { link: 'https://www.example.com/about-us', },  //Not an href/src
            ],
            results = get_unique_urls_from_all_page_elements(page_url, elements)
        ;

        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(2);
        expect(results).toEqual(['https://www.example.com/about-us', 'https://www.example.com/image.jpg']);
    });

});

// get_unique_urls_from_all_page_elements
