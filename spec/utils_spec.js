import { get_unique_urls_from_all_page_elements, enforce_string_or_array_of_strings } from '../src/utils';

describe("Utils", function () {

    it('get_unique_urls_from_all_page_elements filters, maps and uniqifies', () => {
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

    it('enforce_string_or_array_of_strings works', () => {

        const
            func = 'cheese',
            alpha = 'alpha',
            beta = 'beta',
            fail_1 = () => {
                enforce_string_or_array_of_strings(func, [alpha, beta], [alpha])
            },
            fail_2 = () => {
                enforce_string_or_array_of_strings(func)
            },
            fail_3 = () => {
                enforce_string_or_array_of_strings(func, [''])
            },
            fail_4 = () => {
                enforce_string_or_array_of_strings(func, 5)
            }
        ;

        expect(enforce_string_or_array_of_strings(func, alpha)).toEqual([alpha]);
        expect(enforce_string_or_array_of_strings(func, alpha, beta)).toEqual([alpha, beta]);
        expect(enforce_string_or_array_of_strings(func, [alpha, beta])).toEqual([alpha, beta]);


        expect(fail_1).toThrow(`Argument to ${func} must be a string or array of strings, multi-dimensional array provided.`);
        expect(fail_2).toThrow(`Argument to ${func} must be a string or array of strings, nothing provided.`);
        expect(fail_3).toThrow(`Argument to ${func} must be a string or array of strings, array with empty string provided.`);
        expect(fail_4).toThrow(`Argument to ${func} must be a string or array of strings, number provided.`);

    });

});
