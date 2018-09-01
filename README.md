# a11y-report-maker

## Install
    npm install

## Additional packages needed for Chrome:
NOTE: Some of these packages list the `-dev` first but you probably only need the main library

    sudo apt install libx11-xcb-dev libxcomposite-dev libxcursor-dev libxdamage-dev libxi-dev \
    libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 \
    libatk-bridge2.0-0 libgtk-3-0 -y

## Run
    node main.js

## TODO
 * There should be an exclusion list/pattern for URLs
 * Add support for CLI parameters including:
   * URL
   * Parse depth (really number of runs)
   * Exclusions
   * WCAG levels/tags
   * Screen resolution
 * PDF, Images and other non-HTML types are currently processed by this however they error out. Maybe a preliminary test for content type?

## Credits
 * The actual [aXe rule engine](https://github.com/dequelabs/axe-core) belongs 100% to the awesome folks at [Deque University](https://dequeuniversity.com/)
 * The rendering browser is Chrome through [Puppeteer](https://github.com/GoogleChrome/puppeteer/)
