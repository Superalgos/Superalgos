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
import { GPGPUProgram } from './gpgpu_math';
export declare const CHECK_NAN_SNIPPET = "\n  result.r = isNaN.r > 0. ? NAN : result.r;\n  result.g = isNaN.g > 0. ? NAN : result.g;\n  result.b = isNaN.b > 0. ? NAN : result.b;\n  result.a = isNaN.a > 0. ? NAN : result.a;\n";
export declare const ELU_DER = "\n  vec4 bGTEZero = vec4(greaterThanEqual(b, vec4(0.)));\n  return (bGTEZero * a) + ((vec4(1.0) - bGTEZero) * (a * (b + vec4(1.0))));\n";
export declare const NOT_EQUAL = "\n  return vec4(notEqual(a, b));\n";
export declare class BinaryOpPackedProgram implements GPGPUProgram {
    variableNames: string[];
    outputShape: number[];
    userCode: string;
    supportsBroadcasting: boolean;
    packedInputs: boolean;
    packedOutput: boolean;
    constructor(op: string, aShape: number[], bShape: number[], checkOutOfBounds?: boolean);
}
