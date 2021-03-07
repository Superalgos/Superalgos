/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
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
import { IORouter } from './router_registry';
import { IOHandler, ModelArtifacts, ModelArtifactsInfo, ModelStoreManager, SaveResult } from './types';
/**
 * Delete the entire database for tensorflow.js, including the models store.
 */
export declare function deleteDatabase(): Promise<void>;
/**
 * IOHandler subclass: Browser IndexedDB.
 *
 * See the doc string of `browserIndexedDB` for more details.
 */
export declare class BrowserIndexedDB implements IOHandler {
    protected readonly indexedDB: IDBFactory;
    protected readonly modelPath: string;
    static readonly URL_SCHEME = "indexeddb://";
    constructor(modelPath: string);
    save(modelArtifacts: ModelArtifacts): Promise<SaveResult>;
    load(): Promise<ModelArtifacts>;
    /**
     * Perform database action to put model artifacts into or read model artifacts
     * from IndexedDB object store.
     *
     * Whether the action is put or get depends on whether `modelArtifacts` is
     * specified. If it is specified, the action will be put; otherwise the action
     * will be get.
     *
     * @param modelPath A unique string path for the model.
     * @param modelArtifacts If specified, it will be the model artifacts to be
     *   stored in IndexedDB.
     * @returns A `Promise` of `SaveResult`, if the action is put, or a `Promise`
     *   of `ModelArtifacts`, if the action is get.
     */
    private databaseAction;
}
export declare const indexedDBRouter: IORouter;
/**
 * Creates a browser IndexedDB IOHandler for saving and loading models.
 *
 * ```js
 * const model = tf.sequential();
 * model.add(
 *     tf.layers.dense({units: 1, inputShape: [100], activation: 'sigmoid'}));
 *
 * const saveResult = await model.save('indexeddb://MyModel'));
 * console.log(saveResult);
 * ```
 *
 * @param modelPath A unique identifier for the model to be saved. Must be a
 *   non-empty string.
 * @returns An instance of `BrowserIndexedDB` (sublcass of `IOHandler`),
 *   which can be used with, e.g., `tf.Model.save`.
 */
export declare function browserIndexedDB(modelPath: string): IOHandler;
export declare class BrowserIndexedDBManager implements ModelStoreManager {
    private indexedDB;
    constructor();
    listModels(): Promise<{
        [path: string]: ModelArtifactsInfo;
    }>;
    removeModel(path: string): Promise<ModelArtifactsInfo>;
}
