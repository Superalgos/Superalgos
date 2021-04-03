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
import { NamedTensorsMap, TensorArrayMap, TensorListMap } from '../data/types';
import { TensorArray } from './tensor_array';
import { TensorList } from './tensor_list';
import { FunctionExecutor } from './types';
export interface ExecutionContextInfo {
    id: number;
    frameName: string;
    iterationId: number;
}
/**
 * ExecutionContext captures the runtime environment of the node. It keeps
 * track of the current frame and iteration for the control flow ops.
 *
 * For example, typical Dynamic RNN model may contain loops, for which
 * TensorFlow will generate graphs with Enter/Exit nodes to control the
 * current execution frame, and NextIteration Nodes for iteration id increment.
 * For model with branch logic, TensorFLow will generate Switch/Merge ops.
 */
export declare class ExecutionContext {
    readonly weightMap: NamedTensorsMap;
    readonly tensorArrayMap: TensorArrayMap;
    readonly tensorListMap: TensorListMap;
    readonly functionMap: {
        [key: string]: FunctionExecutor;
    };
    private rootContext;
    private contexts;
    private lastId;
    private _currentContextIds;
    constructor(weightMap?: NamedTensorsMap, tensorArrayMap?: TensorArrayMap, tensorListMap?: TensorListMap, functionMap?: {
        [key: string]: FunctionExecutor;
    });
    private newFrame;
    /**
     * Set the current context
     * @param contexts: ExecutionContextInfo[] the current path of execution
     * frames
     */
    currentContext: ExecutionContextInfo[];
    /**
     * Returns the current context in string format.
     */
    readonly currentContextId: string;
    /**
     * Returns the current context and all parent contexts in string format.
     * This allow access to the nodes in the current and parent frames.
     */
    readonly currentContextIds: string[];
    private generateCurrentContextIds;
    private contextIdforContexts;
    /**
     * Enter a new frame, a new context is pushed on the current context list.
     * @param frameId new frame id
     */
    enterFrame(frameId: string): void;
    /**
     * Exit the current frame, the last context is removed from the current
     * context list.
     */
    exitFrame(): void;
    /**
     * Enter the next iteration of a loop, the iteration id of last context is
     * increased.
     */
    nextIteration(): void;
    getWeight(name: string): Tensor[];
    addTensorArray(tensorArray: TensorArray): void;
    getTensorArray(id: number): TensorArray;
    addTensorList(tensorList: TensorList): void;
    getTensorList(id: number): TensorList;
    dispose(keepIds: Set<number>): void;
}
