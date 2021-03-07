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
import { GPGPUContext } from './gpgpu_context';
import { GPGPUProgram } from './gpgpu_math';
export declare class ClipProgram implements GPGPUProgram {
    variableNames: string[];
    userCode: string;
    outputShape: number[];
    minLoc: WebGLUniformLocation;
    maxLoc: WebGLUniformLocation;
    constructor(aShape: number[]);
    getCustomSetupFunc(min: number, max: number): (gpgpu: GPGPUContext, webGLProgram: WebGLProgram) => void;
}
