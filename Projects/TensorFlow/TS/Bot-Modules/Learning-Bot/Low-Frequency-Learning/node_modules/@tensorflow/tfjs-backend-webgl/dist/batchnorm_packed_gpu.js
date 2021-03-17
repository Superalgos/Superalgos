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
import { backend_util } from '@tensorflow/tfjs-core';
export class BatchNormPackedProgram {
    constructor(xShape, meanShape, varianceShape, offsetShape, scaleShape, varianceEpsilon) {
        this.packedInputs = true;
        this.packedOutput = true;
        this.variableNames = ['x', 'mean', 'variance'];
        backend_util.assertAndGetBroadcastShape(xShape, meanShape);
        backend_util.assertAndGetBroadcastShape(xShape, varianceShape);
        let offsetSnippet = 'vec4(0.0)';
        if (offsetShape != null) {
            backend_util.assertAndGetBroadcastShape(xShape, offsetShape);
            this.variableNames.push('offset');
            offsetSnippet = 'getOffsetAtOutCoords()';
        }
        let scaleSnippet = 'vec4(1.0)';
        if (scaleShape != null) {
            backend_util.assertAndGetBroadcastShape(xShape, scaleShape);
            this.variableNames.push('scale');
            scaleSnippet = 'getScaleAtOutCoords()';
        }
        this.outputShape = xShape;
        this.userCode = `
      void main() {
        vec4 offset = ${offsetSnippet};
        vec4 scale = ${scaleSnippet};

        vec4 x = getXAtOutCoords();
        vec4 mean = getMeanAtOutCoords();
        vec4 variance = getVarianceAtOutCoords();

        vec4 inv = scale * inversesqrt(variance + vec4(${varianceEpsilon}));

        setOutput((x - mean) * inv + offset);
      }
    `;
    }
}
//# sourceMappingURL=batchnorm_packed_gpu.js.map