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
import { GPGPUProgram } from './gpgpu_math';
/**
 * Example shader code for
 * `mirrorPad(tf.tensor1d([1, 2, 3], 'int32'), [[2, 2]], 'reflect')`
 * ```
 *    const int start = int(2);
 *    const int end = int(5);
 *
 *    void main() {
 *       int outputLoc = getOutputCoords();
 *       vec4 result = vec4(0.);
 *
 *       int rc = outputLoc;
 *
 *       int source = rc;
 *       if (source < start) {
 *         source = start * 2 - source - 0;
 *       } else if (source >= end) {
 *         source = (end - 1) * 2 - source + 0;
 *       }
 *       source -= start;
 *
 *       result[0] = getChannel(getX(source), source);
 *       rc += 1;
 *       if(rc < 6) {
 *          int source = rc;
 *          if (source < start) {
 *            source = start * 2 - source - 0;
 *          } else if (source >= end) {
 *            source = (end - 1) * 2 - source + 0;
 *          }
 *          source -= start;
 *
 *         result[1] = getChannel(getX(source), source);
 *       }
 *
 *       setOutput(result);
 *     }
 * ```
 */
export declare class MirrorPadPackedProgram implements GPGPUProgram {
    variableNames: string[];
    packedInputs: boolean;
    packedOutput: boolean;
    outputShape: number[];
    userCode: string;
    constructor(xShape: number[], paddings: Array<[number, number]>, mode: 'reflect' | 'symmetric');
}
