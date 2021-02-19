/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
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
import { backend_util, TensorInfo } from '@tensorflow/tfjs-core';
import { MathBackendWebGL } from '../backend_webgl';
declare type Conv2DConfig = {
    x: TensorInfo;
    filter: TensorInfo;
    convInfo: backend_util.Conv2DInfo;
    backend: MathBackendWebGL;
    bias?: TensorInfo;
    preluActivationWeights?: TensorInfo;
    leakyreluAlpha?: number;
    activation?: backend_util.Activation;
};
export declare function conv2dByMatMul({ x, filter, convInfo, backend, bias, preluActivationWeights, leakyreluAlpha, activation }: Conv2DConfig): TensorInfo;
export declare function conv2dWithIm2Row({ x, filter, convInfo, backend, bias, preluActivationWeights, leakyreluAlpha, activation }: Conv2DConfig): TensorInfo;
export {};
