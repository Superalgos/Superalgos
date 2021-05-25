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
import { GPGPUProgram } from './gpgpu_math';
export declare class UnaryOpProgram implements GPGPUProgram {
    variableNames: string[];
    userCode: string;
    outputShape: number[];
    constructor(aShape: number[], opSnippet: string);
}
export declare const CHECK_NAN_SNIPPET = "if (isnan(x)) return x;";
export declare const LINEAR = "return x;";
export declare const ABS = "return abs(x);";
export declare function STEP(alpha?: number): string;
export declare const ELU = "return (x >= 0.0) ? x : (exp(x) - 1.0);";
export declare const RELU: string;
export declare const RELU6: string;
export declare const CLONE = "return x;";
