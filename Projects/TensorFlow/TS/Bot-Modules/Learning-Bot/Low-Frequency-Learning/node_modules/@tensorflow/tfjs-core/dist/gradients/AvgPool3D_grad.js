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
import { AvgPool3D } from '../kernel_names';
import { avgPool3dGrad } from '../ops/avg_pool_3d_grad';
export const avgPool3DGradConfig = {
    kernelName: AvgPool3D,
    inputsToSave: ['x'],
    gradFunc: (dy, saved, attrs) => {
        const [x] = saved;
        const { filterSize, strides, pad, dimRoundingMode } = attrs;
        return {
            x: () => avgPool3dGrad(dy, x, filterSize, strides, pad, dimRoundingMode)
        };
    }
};
//# sourceMappingURL=AvgPool3D_grad.js.map