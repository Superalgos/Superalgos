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
import { ENGINE } from '../../engine';
import { FlipLeftRight } from '../../kernel_names';
import { convertToTensor } from '../../tensor_util_env';
import * as util from '../../util';
import { op } from '../operation';
/**
 * Flips the image left to right. Currently available in the CPU, WebGL, and
 * WASM backends.
 *
 * @param image 4d tensor of shape `[batch, imageHeight, imageWidth, depth]`.
 */
/** @doc {heading: 'Operations', subheading: 'Images', namespace: 'image'} */
function flipLeftRight_(image) {
    const $image = convertToTensor(image, 'image', 'flipLeftRight', 'float32');
    util.assert($image.rank === 4, () => 'Error in flipLeftRight: image must be rank 4,' +
        `but got rank ${$image.rank}.`);
    const inputs = { image: $image };
    const res = ENGINE.runKernel(FlipLeftRight, inputs, {});
    return res;
}
export const flipLeftRight = op({ flipLeftRight_ });
//# sourceMappingURL=flip_left_right.js.map