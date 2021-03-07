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
/**
 * Public API symbols under the tf.node.* namespace.
 */
import { tensorBoard } from './callbacks';
import { decodeBmp, decodeGif, decodeImage, decodeJpeg, decodePng, encodeJpeg, encodePng } from './image';
import { getMetaGraphsFromSavedModel, getNumOfSavedModels, loadSavedModel } from './saved_model';
import { summaryFileWriter } from './tensorboard';
export declare const node: {
    decodeImage: typeof decodeImage;
    decodeBmp: typeof decodeBmp;
    decodeGif: typeof decodeGif;
    decodePng: typeof decodePng;
    decodeJpeg: typeof decodeJpeg;
    encodeJpeg: typeof encodeJpeg;
    encodePng: typeof encodePng;
    summaryFileWriter: typeof summaryFileWriter;
    tensorBoard: typeof tensorBoard;
    getMetaGraphsFromSavedModel: typeof getMetaGraphsFromSavedModel;
    getNumOfSavedModels: typeof getNumOfSavedModels;
    loadSavedModel: typeof loadSavedModel;
};
