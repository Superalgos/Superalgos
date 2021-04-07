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
import { backend_util, DataType, KernelFunc } from '@tensorflow/tfjs-core';
import { SimpleBinaryKernelImplCPU, SimpleUnaryKernelImplCPU } from './shared';
export declare const CHECK_NAN_SNIPPET_UNARY = "if (isnan(x)) return x;";
export declare const CHECK_NAN_SNIPPET_BINARY = "\n  if (isnan(a)) return a;\n  if (isnan(b)) return b;\n";
export declare const CHECK_NAN_SNIPPET_BINARY_PACKED = "\n  result.r = isNaN.r > 0. ? NAN : result.r;\n  result.g = isNaN.g > 0. ? NAN : result.g;\n  result.b = isNaN.b > 0. ? NAN : result.b;\n  result.a = isNaN.a > 0. ? NAN : result.a;\n";
declare type UnaryKernelFuncConfig = {
    opSnippet: string;
    packedOpSnippet?: string;
    cpuKernelImpl?: SimpleUnaryKernelImplCPU;
    dtype?: DataType;
};
/**
 * Template that creates a `KernelFunc` for unary ops.
 * @param opSnippet Op snippet to create `UnaryOpProgram`.
 * @param packedOpSnippet Op snippet to create `UnaryOpPackedProgram`.
 * @param dtype Optional. If set, the result has this dtype. Otherwise, the
 *     result has the same dtype as the first input. This is mainly used in
 *     comparison kernels, such as Equal, Less, Greater, etc.
 */
export declare function unaryKernelFunc({ opSnippet, packedOpSnippet, cpuKernelImpl, dtype }: UnaryKernelFuncConfig): KernelFunc;
declare type BinaryKernelFuncConfig = {
    opSnippet: string;
    packedOpSnippet?: string;
    checkOutOfBounds?: boolean;
    supportsComplex?: boolean;
    cpuKernelImpl?: SimpleBinaryKernelImplCPU;
    dtype?: DataType;
};
/**
 * Template that creates a `KernelFunc` for binary ops.
 * @param opSnippet Op snippet to create `BinaryOpProgram`.
 * @param packedOpSnippet Op snippet to create `BinaryOpPackedProgram`.
 * @param checkOutOfBoundsForPackedProgram Whether to set checkOutOfBounds=true
 *     when creating BinaryOpPackedProgram.
 * @param dtype Optional. If set, the result has this dtype. Otherwise, the
 *     result has the same dtype as the first input. This is mainly used in
 *     comparison kernels, such as Equal, Less, Greater, etc.
 */
export declare function binaryKernelFunc({ opSnippet, packedOpSnippet, checkOutOfBounds, supportsComplex, cpuKernelImpl, dtype }: BinaryKernelFuncConfig): KernelFunc;
export declare function mapActivationToShaderProgram(activation: backend_util.Activation, packed?: boolean): string;
export {};
