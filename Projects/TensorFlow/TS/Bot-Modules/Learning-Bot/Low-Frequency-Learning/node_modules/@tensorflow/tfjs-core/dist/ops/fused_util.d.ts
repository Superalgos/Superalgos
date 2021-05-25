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
import { Tensor } from '../tensor';
import { Activation } from './fused_types';
export declare function getFusedDyActivation(dy: Tensor, y: Tensor, activation: Activation): Tensor;
export declare function getFusedBiasGradient(bias: Tensor, dyActivation: Tensor): Tensor;
export declare function applyActivation(x: Tensor, activation: Activation, preluActivationWeights?: Tensor, leakyreluAlpha?: number): Tensor;
export declare const shouldFuse: (gradientDepth: number, activation: Activation) => boolean;
