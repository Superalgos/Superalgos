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
import { Tensor } from '@tensorflow/tfjs-core';
import { NamedTensorsMap } from '../../data/types';
import { ExecutionContext } from '../../executor/execution_context';
import { ResourceManager } from '../../executor/resource_manager';
import { Node, ValueType } from '../types';
export declare function getParamValue(paramName: string, node: Node, tensorMap: NamedTensorsMap, context: ExecutionContext, resourceManager?: ResourceManager): ValueType;
/**
 * Retrieve the tensor from tensorsMap based on input name.
 * @param name Node input name
 * @param tensorsMap Tensors map keyed by the node
 * @param context contains tensors and information for running the current node.
 * @param resourceManager Optional. Contains global resources of the model.
 */
export declare function getTensor(name: string, tensorsMap: NamedTensorsMap, context: ExecutionContext, resourceManager?: ResourceManager): Tensor;
/**
 * Retrieve the tensors based on input name for current context.
 * @param name Node input name
 * @param tensorsMap Tensors map keyed by the node
 */
export declare function getTensorsForCurrentContenxt(name: string, tensorsMap: NamedTensorsMap, context: ExecutionContext): Tensor[];
/**
 * Returns the node name and index from the Node input name.
 * @param inputName The input name of the node, in format of
 * node_name:output_index, i.e. MatMul:0, if the output_index is not set, it is
 * default to 0.
 */
export declare function getNodeNameAndIndex(inputName: string, context?: ExecutionContext): [string, number];
export declare function parseNodeName(name: string): [string, number];
export declare function split(arr: number[], size: number): number[][];
export declare function getPadding(node: Node, tensorMap: NamedTensorsMap, context: ExecutionContext): ValueType;
/**
 *  Reuse the tensor if it is marked as keep, otherwise clone the tensor to
 *  avoid disposal. This is important for TensorArray and TensorList ops, since
 *  internally they use a tensor as the id for TensorArray and TensorList, and
 * to simplify lookup, they also use Tensor.id as the key to the internal map.
 * These id tensors have been marked as kept in the backend, we need avoid clone
 * them in order to create new Tensor.id.
 * @param tensor
 */
export declare function cloneTensor(tensor: Tensor): Tensor;
