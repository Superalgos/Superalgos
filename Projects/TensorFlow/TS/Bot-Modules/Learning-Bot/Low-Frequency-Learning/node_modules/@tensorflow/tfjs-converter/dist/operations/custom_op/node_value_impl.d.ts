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
import { Tensor } from '@tensorflow/tfjs-core';
import { NamedTensorsMap } from '../../data/types';
import { ExecutionContext } from '../../executor/execution_context';
import { GraphNode, Node, ValueType } from '../types';
/**
 * Helper class for lookup inputs and params for nodes in the model graph.
 */
export declare class NodeValueImpl implements GraphNode {
    private node;
    private tensorMap;
    private context;
    readonly inputs: Tensor[];
    readonly attrs: {
        [key: string]: ValueType;
    };
    constructor(node: Node, tensorMap: NamedTensorsMap, context: ExecutionContext);
    /**
     * Return the value of the attribute or input param.
     * @param name String: name of attribute or input param.
     */
    private getInput;
    /**
     * Return the value of the attribute or input param.
     * @param name String: name of attribute or input param.
     */
    private getAttr;
}
