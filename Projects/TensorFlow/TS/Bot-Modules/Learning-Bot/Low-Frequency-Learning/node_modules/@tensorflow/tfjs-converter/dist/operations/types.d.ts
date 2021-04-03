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
import * as tensorflow from '../data/compiled_api';
import { NamedTensorsMap } from '../data/types';
import { ExecutionContext } from '../executor/execution_context';
import { ResourceManager } from '../executor/resource_manager';
export declare type ParamType = 'number' | 'string' | 'string[]' | 'number[]' | 'bool' | 'bool[]' | 'shape' | 'shape[]' | 'tensor' | 'tensors' | 'dtype' | 'dtype[]' | 'func';
export declare type Category = 'arithmetic' | 'basic_math' | 'control' | 'convolution' | 'custom' | 'dynamic' | 'evaluation' | 'image' | 'creation' | 'graph' | 'logical' | 'matrices' | 'normalization' | 'reduction' | 'slice_join' | 'spectral' | 'transformation' | 'hash_table';
export declare interface ParamMapper {
    name: string;
    type: ParamType;
    defaultValue?: ValueType;
    notSupported?: boolean;
}
export declare interface InputParamMapper extends ParamMapper {
    start: number;
    end?: number;
}
export declare interface AttrParamMapper extends ParamMapper {
    tfName?: string;
    tfDeprecatedName?: string;
}
export interface InternalOpExecutor {
    (node: Node, tensorMap: NamedTensorsMap, context: ExecutionContext): Tensor | Tensor[];
}
export interface InternalOpAsyncExecutor {
    (node: Node, tensorMap: NamedTensorsMap, context: ExecutionContext, resourceManager?: ResourceManager): Promise<Tensor[]>;
}
export declare interface OpMapper {
    tfOpName: string;
    category?: Category;
    inputs?: InputParamMapper[];
    attrs?: AttrParamMapper[];
    customExecutor?: OpExecutor;
}
export declare interface Node {
    signatureKey?: string;
    name: string;
    op: string;
    category: Category;
    inputNames: string[];
    inputs: Node[];
    inputParams: {
        [key: string]: InputParamValue;
    };
    attrParams: {
        [key: string]: ParamValue;
    };
    children: Node[];
    rawAttrs?: {
        [k: string]: tensorflow.IAttrValue;
    };
    defaultOutput?: number;
}
export declare interface Graph {
    nodes: {
        [key: string]: Node;
    };
    placeholders: Node[];
    inputs: Node[];
    outputs: Node[];
    weights: Node[];
    signature?: tensorflow.ISignatureDef;
    functions?: {
        [key: string]: Graph;
    };
    initNodes?: Node[];
}
export declare type ValueType = string | string[] | number | number[] | number[][] | boolean | boolean[] | Tensor | Tensor[];
export declare interface ParamValue {
    value?: ValueType;
    type: ParamType;
}
export declare interface InputParamValue extends ParamValue {
    inputIndexStart?: number;
    inputIndexEnd?: number;
}
export interface OpExecutor {
    (node: GraphNode): Tensor | Tensor[] | Promise<Tensor | Tensor[]>;
}
export interface GraphNode {
    inputs: Tensor[];
    attrs: {
        [key: string]: ValueType;
    };
}
