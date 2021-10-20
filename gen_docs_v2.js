/**
 * Copyright 2018 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author ebidel@ (Eric Bidelman)
 */

 /**
  * Discovers all the pages in site or single page app (SPA) and creates
  * a tree of the result in ./output/<site slug/crawl.json. Optionally
  * takes screenshots of each page as it is visited.
  *
  * Usage:
  *   node crawlsite.js
  *   URL=https://yourspa.com node crawlsite.js
  *   URL=https://yourspa.com node crawlsite.js --screenshots
  *
  * Then open the visualizer in a browser:
  *   http://localhost:8080/html/d3tree.html
  *   http://localhost:8080/html/d3tree.html?url=../output/https___yourspa.com/crawl.json
  *
  *Start Server:
  *   node server.js
  *
  */

  /**
   * Altered for Superalgos documentation export
   * 
   * @author NAmorim@ (Nuno Amorim)
   * 
   */

  const fs = require('fs');
  const del = require('del');
  const util = require('util');
  const puppeteer = require('puppeteer');
  const sharp = require('sharp');
  
  const URL = process.env.URL || 'http://localhost:34248/';
  const SCREENSHOTS = process.argv.includes('--screenshots');
  const DEPTH = parseInt(process.env.DEPTH) || 2;
  const VIEWPORT = SCREENSHOTS ? {width: 1028, height: 800, deviceScaleFactor: 2} : null;
  const OUT_DIR = process.env.OUTDIR || `doc_output/${slugify(URL)}`;
  
  const crawledPages = new Map();
  const maxDepth = DEPTH; // Subpage depth to crawl site.
  
  function slugify(str) {
    return str.replace(/[\/:]/g, '_');
  }
  
  function mkdirSync(dirPath) {
    try {
      dirPath.split('/').reduce((parentPath, dirName) => {
        const currentPath = parentPath + dirName;
        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath);
        }
        return currentPath + '/';
      }, '');
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
  }
  
  /**
   * Finds all anchors on the page, inclusive of those within shadow roots.
   * Note: Intended to be run in the context of the page.
   * @param {boolean=} sameOrigin When true, only considers links from the same origin as the app.
   * @return {!Array<string>} List of anchor hrefs.
   */
  function collectAllSameOriginAnchorsDeep(sameOrigin = true) {
    const allElements = [];
  
    const findAllElements = function(nodes) {
      for (let i = 0, el; el = nodes[i]; ++i) {
        allElements.push(el);
        // If the element has a shadow root, dig deeper.
        if (el.shadowRoot) {
          findAllElements(el.shadowRoot.querySelectorAll('*'));
        }
      }
    };
  
    findAllElements(document.querySelectorAll('doc*'));
  
    const filtered = allElements
      .filter(el => el.localName === 'a' && el.href) // element is an anchor with an href.
      .filter(el => el.href !== location.href) // link doesn't point to page's own URL.
      .filter(el => {
        if (sameOrigin) {
          return new URL(location).origin === new URL(el.href).origin;
        }
        return true;
      })
      .map(a => a.href);
  
    return Array.from(new Set(filtered));
  }
  
  /**
   * Crawls a URL by visiting an url, then recursively visiting any child subpages.
   * @param {!Browser} browser
   * @param {{url: string, title: string, img?: string, children: !Array<!Object>}} page Current page.
   * @param {number=} depth Current subtree depth of crawl.
   */
  async function crawl(browser, page, depth = 0) {
    if (depth > maxDepth) {
      return;
    }
  
    // If we've already crawled the URL, we know its children.
    if (crawledPages.has(page.url)) {
      console.log(`Reusing route: ${page.url}`);
      const item = crawledPages.get(page.url);
      page.title = item.title;
      page.img = item.img;
      page.children = item.children;
      // Fill in the children with details (if they already exist).
      page.children.forEach(c => {
        const item = crawledPages.get(c.url);
        c.title = item ? item.title : '';
        c.img = item ? item.img : null;
      });
      return;
    } else {
      console.log(`Loading: ${page.url}`);
  
      const newPage = await browser.newPage();
      await newPage.goto(page.url, {waitUntil: 'networkidle2'});
  
      let anchors = await newPage.evaluate(collectAllSameOriginAnchorsDeep);
      anchors = anchors.filter(a => a !== URL) // link doesn't point to start url of crawl.
  
      page.title = await newPage.evaluate('document.title');
      page.children = anchors.map(url => ({url}));
  
      if (SCREENSHOTS) {
        const path = `./${OUT_DIR}/${slugify(page.url)}.png`;
        let imgBuff = await newPage.screenshot({fullPage: false});
        imgBuff = await sharp(imgBuff).resize(null, 150).toBuffer(); // resize image to 150 x auto.
        util.promisify(fs.writeFile)(path, imgBuff); // async
        page.img = `data:img/png;base64,${imgBuff.toString('base64')}`;
      }
  
      crawledPages.set(page.url, page); // cache it.
  
      await newPage.close();
    }
  
    // Crawl subpages.
    for (const childPage of page.children) {
      await crawl(browser, childPage, depth + 1);
    }
  }
  
  (async() => {
  
  mkdirSync(OUT_DIR); // create output dir if it doesn't exist.
  await del([`${OUT_DIR}/*`]); // cleanup after last run.
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  if (VIEWPORT) {
    await page.setViewport(VIEWPORT);
  }
  
  const root = {url: URL};
  await crawl(browser, root);
  
  await util.promisify(fs.writeFile)(`./${OUT_DIR}/crawl.json`, JSON.stringify(root, null, ' '));
  
  await browser.close();
  
  })();
  