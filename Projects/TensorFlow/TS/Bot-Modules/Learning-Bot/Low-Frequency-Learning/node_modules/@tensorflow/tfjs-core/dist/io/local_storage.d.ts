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
 * Purge all tensorflow.js-saved model artifacts from local storage.
 *
 * @returns Paths of the models purged.
 */
export declare function purgeLocalStorageArtifacts(): string[];
declare type LocalStorageKeys = {
    info: string;
    topology: string;
    weightSpecs: string;
    weightData: string;
    modelMetadata: string;
};
/**
 * IOHandler subclass: Browser Local Storage.
 *
 * See the doc string to `browserLocalStorage` for more details.
 */
export declare class BrowserLocalStorage implements IOHandler {
    protected readonly LS: Storage;
    protected readonly modelPath: string;
    protected readonly keys: LocalStorageKeys;
    static readonly URL_SCHEME = "localstorage://";
    constructor(modelPath: string);
    /**
     * Save model artifacts to browser local storage.
     *
     * See the documentation to `browserLocalStorage` for details on the saved
     * artifacts.
     *
     * @param modelArtifacts The model artifacts to be stored.
     * @returns An instance of SaveResult.
     */
    save(modelArtifacts: ModelArtifacts): Promise<SaveResult>;
    /**
     * Load a model from local storage.
     *
     * See the documentation to `browserLocalStorage` for details on the saved
     * artifacts.
     *
     * @returns The loaded model (if loading succeeds).
     */
    load(): Promise<ModelArtifacts>;
}
export declare const localStorageRouter: IORouter;
/**
 * Factory function for local storage IOHandler.
 *
 * This `IOHandler` supports both `save` and `load`.
 *
 * For each model's saved artifacts, four items are saved to local storage.
 *   - `${PATH_SEPARATOR}/${modelPath}/info`: Contains meta-info about the
 *     model, such as date saved, type of the topology, size in bytes, etc.
 *   - `${PATH_SEPARATOR}/${modelPath}/topology`: Model topology. For Keras-
 *     style models, this is a stringized JSON.
 *   - `${PATH_SEPARATOR}/${modelPath}/weight_specs`: Weight specs of the
 *     model, can be used to decode the saved binary weight values (see
 *     item below).
 *   - `${PATH_SEPARATOR}/${modelPath}/weight_data`: Concatenated binary
 *     weight values, stored as a base64-encoded string.
 *
 * Saving may throw an `Error` if the total size of the artifacts exceed the
 * browser-specific quota.
 *
 * @param modelPath A unique identifier for the model to be saved. Must be a
 *   non-empty string.
 * @returns An instance of `IOHandler`, which can be used with, e.g.,
 *   `tf.Model.save`.
 */
export declare function browserLocalStorage(modelPath: string): IOHandler;
export declare class BrowserLocalStorageManager implements ModelStoreManager {
    private readonly LS;
    constructor();
    listModels(): Promise<{
        [path: string]: ModelArtifactsInfo;
    }>;
    removeModel(path: string): Promise<ModelArtifactsInfo>;
}
export {};
