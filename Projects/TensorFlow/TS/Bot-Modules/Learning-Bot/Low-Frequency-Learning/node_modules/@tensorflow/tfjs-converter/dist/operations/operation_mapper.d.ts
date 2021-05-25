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
import { DataType } from '@tensorflow/tfjs-core';
import * as tensorflow from '../data/compiled_api';
import { Graph } from './types';
export declare class OperationMapper {
    private static _instance;
    private opMappers;
    static readonly Instance: OperationMapper;
    private constructor();
    transformGraph(graph: tensorflow.IGraphDef, signature?: tensorflow.ISignatureDef): Graph;
    private mapSignatureEntries;
    private mapNode;
    private mapFunction;
    private mapArgsToSignature;
    private mapArgToTensorInfo;
}
export declare function decodeBase64(text: string): string;
export declare function parseStringParam(s: [] | string, keepCase: boolean): string;
export declare function getStringParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def: string, keepCase?: boolean): string;
export declare function getBoolParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def: boolean): boolean;
export declare function getNumberParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def: number): number;
export declare function parseDtypeParam(value: string | tensorflow.DataType): DataType;
export declare function getFuncParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def: string): string;
export declare function getDtypeParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def: DataType): DataType;
export declare function getDtypeArrayParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def: DataType[]): DataType[];
export declare function parseTensorShapeParam(shape: tensorflow.ITensorShape): number[] | undefined;
export declare function getTensorShapeParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def?: number[]): number[] | undefined;
export declare function getNumericArrayParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def: number[]): number[];
export declare function getStringArrayParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def: string[], keepCase?: boolean): string[];
export declare function getTensorShapeArrayParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def: number[][]): number[][];
export declare function getBoolArrayParam(attrs: {
    [key: string]: tensorflow.IAttrValue;
}, name: string, def: boolean[]): boolean[];
