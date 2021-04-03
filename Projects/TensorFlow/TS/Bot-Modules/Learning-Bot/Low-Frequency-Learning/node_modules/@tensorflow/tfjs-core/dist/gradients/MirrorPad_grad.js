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
import { MirrorPad } from '../kernel_names';
import { slice } from '../ops/slice';
export const mirrorPadGradConfig = {
    kernelName: MirrorPad,
    inputsToSave: ['x'],
    gradFunc: (dy, saved, attrs) => {
        // Pad introduces values around the original tensor, so the gradient
        // slices the original shape out of the gradient.
        const x = saved[0];
        const { paddings } = attrs;
        const begin = paddings.map(p => p[0]);
        return { x: () => slice(dy, begin, x.shape) };
    }
};
//# sourceMappingURL=MirrorPad_grad.js.map