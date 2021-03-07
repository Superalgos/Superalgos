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
import { InputParamValue, OpMapper, ParamValue } from '../types';
import { Node } from '../types';
export declare function createNumberAttr(value: number): ParamValue;
export declare function createNumberAttrFromIndex(inputIndex: number): InputParamValue;
export declare function createStrAttr(str: string): ParamValue;
export declare function createStrArrayAttr(strs: string[]): ParamValue;
export declare function createBoolAttr(value: boolean): ParamValue;
export declare function createTensorShapeAttr(value: number[]): ParamValue;
export declare function createShapeAttrFromIndex(inputIndex: number): InputParamValue;
export declare function createNumericArrayAttr(value: number[]): ParamValue;
export declare function createNumericArrayAttrFromIndex(inputIndex: number): InputParamValue;
export declare function createBooleanArrayAttrFromIndex(inputIndex: number): InputParamValue;
export declare function createTensorAttr(index: number): InputParamValue;
export declare function createTensorsAttr(index: number, paramLength: number): InputParamValue;
export declare function createDtypeAttr(dtype: string): ParamValue;
export declare function validateParam(node: Node, opMappers: OpMapper[], tfOpName?: string): boolean;
