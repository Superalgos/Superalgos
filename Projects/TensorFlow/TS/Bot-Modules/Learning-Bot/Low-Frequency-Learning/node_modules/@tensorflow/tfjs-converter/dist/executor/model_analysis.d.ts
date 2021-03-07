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
import { NamedTensorMap } from '@tensorflow/tfjs-core';
import { NamedTensorsMap } from '../data/types';
import { Graph, Node } from '../operations/types';
export interface ExecutionInfo {
    inputs: NamedTensorMap;
    outputs: Node[];
    usedNodes: Set<string>;
    missingInputs: string[];
    dynamicNode: Node;
    syncInputs: string[];
}
/**
 * Given graph inputs and desired outputs, find the minimal set of nodes
 * to execute in order to compute the outputs. In addition return other useful
 * info such:
 * - Missing inputs needed to compute the output.
 * - Whether the subgraph contains dynamic ops (control flow, dynamic shape).
 * - Alternative inputs in order to avoid async (dynamic op) execution.
 */
export declare function getExecutionSubgraph(inputs: NamedTensorMap, outputs: Node[], weightMap: NamedTensorsMap, initNodes?: Node[]): ExecutionInfo;
/**
 * Given the execution info, return a list of nodes in topological order that
 * need to be executed to compute the output.
 */
export declare function getNodesInTopologicalOrder(graph: Graph, weightMap: NamedTensorsMap, executionInfo: ExecutionInfo): Node[];
export declare function isControlFlow(node: Node): boolean;
export declare function isDynamicShape(node: Node): boolean;
export declare function isHashTable(node: Node): boolean;
