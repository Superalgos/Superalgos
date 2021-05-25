/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import '../flags';
import { env } from '../environment';
import { BrowserIndexedDB, BrowserIndexedDBManager } from '../io/indexed_db';
import { BrowserLocalStorage, BrowserLocalStorageManager } from '../io/local_storage';
import { ModelStoreManagerRegistry } from '../io/model_management';
export class PlatformBrowser {
    fetch(path, init) {
        return fetch(path, init);
    }
    now() {
        return performance.now();
    }
    encode(text, encoding) {
        if (encoding !== 'utf-8' && encoding !== 'utf8') {
            throw new Error(`Browser's encoder only supports utf-8, but got ${encoding}`);
        }
        if (this.textEncoder == null) {
            this.textEncoder = new TextEncoder();
        }
        return this.textEncoder.encode(text);
    }
    decode(bytes, encoding) {
        return new TextDecoder(encoding).decode(bytes);
    }
}
if (env().get('IS_BROWSER')) {
    env().setPlatform('browser', new PlatformBrowser());
    // Register LocalStorage IOHandler
    try {
        ModelStoreManagerRegistry.registerManager(BrowserLocalStorage.URL_SCHEME, new BrowserLocalStorageManager());
    }
    catch (err) {
    }
    // Register IndexedDB IOHandler
    try {
        ModelStoreManagerRegistry.registerManager(BrowserIndexedDB.URL_SCHEME, new BrowserIndexedDBManager());
    }
    catch (err) {
    }
}
//# sourceMappingURL=platform_browser.js.map