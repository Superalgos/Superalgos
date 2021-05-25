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
import { Bincount } from '@tensorflow/tfjs-core';
import { bincountImpl } from './Bincount_impl';
export function bincount(args) {
    const { inputs, backend, attrs } = args;
    const { x, weights } = inputs;
    const { size } = attrs;
    const xVals = backend.data.get(x.dataId).values;
    const weightsVals = backend.data.get(weights.dataId).values;
    const outVals = bincountImpl(xVals, weightsVals, weights.dtype, weights.shape, size);
    return backend.makeTensorInfo([size], weights.dtype, outVals);
}
export const bincountConfig = {
    kernelName: Bincount,
    backendName: 'cpu',
    kernelFunc: bincount
};
//# sourceMappingURL=Bincount.js.map