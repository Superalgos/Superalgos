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
import { Tensor2D, Tensor3D } from '../tensor';
import { TensorLike } from '../types';
import * as conv_util from './conv_util';
/**
 * Computes a 1D convolution over the input x.
 *
 * @param x The input tensor, of rank 3 or rank 2, of shape
 *     `[batch, width, inChannels]`. If rank 2, batch of 1 is assumed.
 * @param filter The filter, rank 3, of shape
 *     `[filterWidth, inDepth, outDepth]`.
 * @param stride The number of entries by which the filter is moved right at
 *     each step.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_guides/python/nn#Convolution](
 *          https://www.tensorflow.org/api_guides/python/nn#Convolution)
 * @param dataFormat An optional string from "NWC", "NCW". Defaults to "NWC",
 *     the data is stored in the order of [batch, in_width, in_channels]. Only
 *     "NWC" is currently supported.
 * @param dilation The dilation rate in which we sample input values in
 *     atrous convolution. Defaults to `1`. If it is greater than 1, then
 *     stride must be `1`.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function conv1d_<T extends Tensor2D | Tensor3D>(x: T | TensorLike, filter: Tensor3D | TensorLike, stride: number, pad: 'valid' | 'same' | number | conv_util.ExplicitPadding, dataFormat?: 'NWC' | 'NCW', dilation?: number, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;
export declare const conv1d: typeof conv1d_;
export {};
