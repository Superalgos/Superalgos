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
import * as tf from '@tensorflow/tfjs';
export declare class NodeFileSystem implements tf.io.IOHandler {
    static readonly URL_SCHEME = "file://";
    protected readonly path: string | string[];
    readonly MODEL_JSON_FILENAME = "model.json";
    readonly WEIGHTS_BINARY_FILENAME = "weights.bin";
    readonly MODEL_BINARY_FILENAME = "tensorflowjs.pb";
    /**
     * Constructor of the NodeFileSystem IOHandler.
     * @param path A single path or an Array of paths.
     *   For saving: expects a single path pointing to an existing or nonexistent
     *     directory. If the directory does not exist, it will be
     *     created.
     *   For loading:
     *     - If the model has JSON topology (e.g., `tf.Model`), a single path
     *       pointing to the JSON file (usually named `model.json`) is expected.
     *       The JSON file is expected to contain `modelTopology` and/or
     *       `weightsManifest`. If `weightManifest` exists, the values of the
     *       weights will be loaded from relative paths (relative to the directory
     *       of `model.json`) as contained in `weightManifest`.
     *     - If the model has binary (protocol buffer GraphDef) topology,
     *       an Array of two paths is expected: the first path should point to the
     *       .pb file and the second path should point to the weight manifest
     *       JSON file.
     */
    constructor(path: string | string[]);
    save(modelArtifacts: tf.io.ModelArtifacts): Promise<tf.io.SaveResult>;
    load(): Promise<tf.io.ModelArtifacts>;
    protected loadBinaryModel(): Promise<tf.io.ModelArtifacts>;
    protected loadJSONModel(): Promise<tf.io.ModelArtifacts>;
    private loadWeights;
    /**
     * For each item in `this.path`, creates a directory at the path or verify
     * that the path exists as a directory.
     */
    protected createOrVerifyDirectory(): Promise<void>;
}
export declare const nodeFileSystemRouter: (url: string | string[]) => NodeFileSystem;
/**
 * Factory function for Node.js native file system IO Handler.
 *
 * @param path A single path or an Array of paths.
 *   For saving: expects a single path pointing to an existing or nonexistent
 *     directory. If the directory does not exist, it will be
 *     created.
 *   For loading:
 *     - If the model has JSON topology (e.g., `tf.Model`), a single path
 *       pointing to the JSON file (usually named `model.json`) is expected.
 *       The JSON file is expected to contain `modelTopology` and/or
 *       `weightsManifest`. If `weightManifest` exists, the values of the
 *       weights will be loaded from relative paths (relative to the directory
 *       of `model.json`) as contained in `weightManifest`.
 *     - If the model has binary (protocol buffer GraphDef) topology,
 *       an Array of two paths is expected: the first path should point to the
 *        .pb file and the second path should point to the weight manifest
 *       JSON file.
 */
export declare function fileSystem(path: string | string[]): NodeFileSystem;
