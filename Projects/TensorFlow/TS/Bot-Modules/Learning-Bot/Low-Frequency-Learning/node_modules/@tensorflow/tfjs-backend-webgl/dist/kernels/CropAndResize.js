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
import { CropAndResize } from '@tensorflow/tfjs-core';
import { CropAndResizeProgram } from '../crop_and_resize_gpu';
export const cropAndResize = (args) => {
    const { inputs, backend, attrs } = args;
    const { image, boxes, boxInd } = inputs;
    const { cropSize, method, extrapolationValue } = attrs;
    const program = new CropAndResizeProgram(image.shape, boxes.shape, cropSize, method, extrapolationValue);
    return backend.runWebGLProgram(program, [image, boxes, boxInd], 'float32');
};
export const cropAndResizeConfig = {
    kernelName: CropAndResize,
    backendName: 'webgl',
    kernelFunc: cropAndResize
};
//# sourceMappingURL=CropAndResize.js.map