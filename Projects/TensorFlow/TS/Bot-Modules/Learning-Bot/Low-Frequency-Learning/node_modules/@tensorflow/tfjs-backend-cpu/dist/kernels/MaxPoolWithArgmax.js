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
import { MaxPoolWithArgmax } from '@tensorflow/tfjs-core';
import { backend_util } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
import { maxPoolWithArgmaxImpl } from './MaxPoolWithArgmax_impl';
export const maxPoolWithArgmaxConfig = {
    kernelName: MaxPoolWithArgmax,
    backendName: 'cpu',
    kernelFunc: ({ inputs, attrs, backend }) => {
        const { x } = inputs;
        const { filterSize, strides, pad, includeBatchInIndex } = attrs;
        const cpuBackend = backend;
        assertNotComplex(x, 'MaxPoolWithArgmax');
        const values = cpuBackend.data.get(x.dataId).values;
        const convInfo = backend_util.computePool2DInfo(x.shape, filterSize, strides, [1, 1], pad);
        const [pooled, indexes] = maxPoolWithArgmaxImpl(values, x.shape, x.dtype, includeBatchInIndex, convInfo);
        const pooledDataId = cpuBackend.write(pooled, convInfo.outShape, x.dtype);
        const indexesDataId = cpuBackend.write(indexes, convInfo.outShape, x.dtype);
        return [
            { dataId: pooledDataId, shape: convInfo.outShape, dtype: x.dtype },
            { dataId: indexesDataId, shape: convInfo.outShape, dtype: 'int32' }
        ];
    }
};
//# sourceMappingURL=MaxPoolWithArgmax.js.map