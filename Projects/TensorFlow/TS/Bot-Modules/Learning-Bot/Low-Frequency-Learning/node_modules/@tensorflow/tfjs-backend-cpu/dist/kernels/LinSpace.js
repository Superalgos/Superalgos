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
import { LinSpace } from '@tensorflow/tfjs-core';
import { linSpaceImpl } from './LinSpace_impl';
export function linSpace(args) {
    const { backend, attrs } = args;
    const { start, stop, num } = attrs;
    const outVals = linSpaceImpl(start, stop, num);
    return backend.makeTensorInfo([outVals.length], 'float32', outVals);
}
export const linSpaceConfig = {
    kernelName: LinSpace,
    backendName: 'cpu',
    kernelFunc: linSpace
};
//# sourceMappingURL=LinSpace.js.map