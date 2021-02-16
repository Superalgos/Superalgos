/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
import { Tensor } from './tensor';
import { NamedTensorMap } from './tensor_types';
export interface TapeNode {
    id: number;
    kernelName: string;
    outputs: Tensor[];
    inputs: NamedTensorMap;
    gradient?: (dys: Tensor[]) => NamedGradientMap;
    saved?: Tensor[];
}
export declare type NamedGradientMap = {
    [inputName: string]: () => Tensor;
};
/**
 * Computes a list of TapeNodes that connect x to y, filtering everything else
 * out and preserving the order of the original tape elements.
 *
 * @param tape The tape elements to filter.
 * @param xs The input Tensors.
 * @param y The output Tensor.
 */
export declare function getFilteredNodesXToY(tape: TapeNode[], xs: Tensor[], y: Tensor): TapeNode[];
/**
 * Backpropagate gradients through the filtered TapeNodes.
 *
 * @param tensorAccumulatedGradientMap A map of Tensor to its gradient. This map
 * is mutated by this method.
 * @param filteredTape The filtered TapeNodes to backprop through.
 */
export declare function backpropagateGradients(tensorAccumulatedGradientMap: {
    [tensorId: number]: Tensor;
}, filteredTape: TapeNode[], tidy: (f: Function) => Tensor, add: (a: Tensor, b: Tensor) => Tensor): void;
