/**
 * @name get list of links
 *
 * @desc Scrapes docs div for links
 */
 const fs = require('fs');
 const puppeteer = require('puppeteer');

 // URL of the page we want to scrape
 const url = 'http://localhost:34248';
 const path = "docs/" + `page-${Date.now()}.html`;

 (async () => {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    // Wait that network traffic stops. This is localhost, maybe not relevant?
    await page.goto(url, {waitUntil: 'networkidle2'})
    // Wait for page load and get the selector needed
    await page.waitForSelector('.credits', {hidden: false});
    //await page.waitForNavigation(5); // Another solution??

  // Gather asset page urls for all the document pages
    const assetUrls = await page.$$eval(
        'a.onClick', onClick => { return anchors.map(anchor => anchor.textContent)});

    const results = [];

    // Visit each assets page one by one
    for (let assetsUrl of assetUrls) {
        await page.goto(assetsUrl);

        // Now collect all the ICO urls.
        const icoUrls = await page.$$eval(
        '#page-wrapper > main > div.container > div > table > tbody > tr > td:nth-child(2) a',
        links => links.map(link => link.href)
        );

        // Visit each ICO one by one and collect the data.
        for (let icoUrl of icoUrls) {
        await page.goto(icoUrl);

        const icoImgUrl = await page.$eval('#asset-logo-wrapper img', img => img.src);
        const icoName = await page.$eval('h1', h1 => h1.innerText.trim());
        // TODO: Gather all the needed info like description etc here.

        results.push([{
            icoName,
            icoUrl,
            icoImgUrl
        }]);
        }
    }

    // Results are ready
    console.log(results);
    fs.writeFileSync(path, await page.content());

    await page.tracing.stop()
    await browser.close()
 })()