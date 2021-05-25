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
export class DepthToSpaceProgram {
    constructor(outputShape, blockSize, dataFormat) {
        this.variableNames = ['x'];
        this.outputShape = [];
        this.outputShape = outputShape;
        this.blockSize = blockSize;
        this.dataFormat = dataFormat;
        this.userCode = `
    void main() {
      ivec4 coords = getOutputCoords();
      int b = coords[0];
      int h = ${this.getHeightCoordString()};
      int w = ${this.getWidthCoordString()};
      int d = ${this.getDepthCoordString()};

      int in_h = h / ${blockSize};
      int offset_h = imod(h, ${blockSize});
      int in_w = w / ${blockSize};
      int offset_w = imod(w, ${blockSize});
      int offset_d = (offset_h * ${blockSize} + offset_w) *
        ${this.getOutputDepthSize()};
      int in_d = d + offset_d;

      float result = ${this.getInputSamplingString()};
      setOutput(result);
    }
  `;
    }
    getHeightCoordString() {
        if (this.dataFormat === 'NHWC') {
            return `coords[1]`;
        }
        else {
            return `coords[2]`;
        }
    }
    getWidthCoordString() {
        if (this.dataFormat === 'NHWC') {
            return `coords[2]`;
        }
        else {
            return `coords[3]`;
        }
    }
    getDepthCoordString() {
        if (this.dataFormat === 'NHWC') {
            return `coords[3]`;
        }
        else {
            return `coords[1]`;
        }
    }
    getOutputDepthSize() {
        if (this.dataFormat === 'NHWC') {
            return this.outputShape[3];
        }
        else {
            return this.outputShape[1];
        }
    }
    getInputSamplingString() {
        if (this.dataFormat === 'NHWC') {
            return `getX(b, in_h, in_w, in_d)`;
        }
        else {
            return `getX(b, in_d, in_h, in_w)`;
        }
    }
}
//# sourceMappingURL=depth_to_space_gpu.js.map