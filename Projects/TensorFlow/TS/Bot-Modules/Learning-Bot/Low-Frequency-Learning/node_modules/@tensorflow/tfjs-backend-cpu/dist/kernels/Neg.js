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
import { Neg, util } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
import { multiplyImpl } from './Multiply';
export function negImpl(xVals, xShape, xDtype) {
    const minusOne = util.createScalarValue(-1, xDtype);
    return multiplyImpl([], xShape, minusOne, xVals, xDtype);
}
export function neg(args) {
    const { inputs, backend } = args;
    const { x } = inputs;
    assertNotComplex(x, 'neg');
    const xVals = backend.data.get(x.dataId).values;
    const [res, newShape] = negImpl(xVals, x.shape, x.dtype);
    return backend.makeTensorInfo(newShape, x.dtype, res);
}
export const negConfig = {
    kernelName: Neg,
    backendName: 'cpu',
    kernelFunc: neg
};
//# sourceMappingURL=Neg.js.map