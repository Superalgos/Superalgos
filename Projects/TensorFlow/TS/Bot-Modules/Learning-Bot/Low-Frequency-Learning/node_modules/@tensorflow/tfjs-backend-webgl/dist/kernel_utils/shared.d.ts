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
import * as shared from '@tensorflow/tfjs-backend-cpu/dist/shared';
import { SimpleBinaryKernelImpl } from '@tensorflow/tfjs-backend-cpu/dist/shared';
import { SimpleUnaryImpl } from '@tensorflow/tfjs-backend-cpu/dist/utils/unary_types';
export declare type SimpleBinaryKernelImplCPU = SimpleBinaryKernelImpl;
export declare type SimpleUnaryKernelImplCPU = SimpleUnaryImpl;
declare const addImplCPU: shared.SimpleBinaryKernelImpl, bincountImplCPU: typeof shared.bincountImpl, bincountReduceImplCPU: typeof shared.bincountReduceImpl, ceilImplCPU: SimpleUnaryImpl, concatImplCPU: typeof shared.concatImpl, expImplCPU: SimpleUnaryImpl, expm1ImplCPU: SimpleUnaryImpl, floorImplCPU: SimpleUnaryImpl, gatherV2ImplCPU: typeof shared.gatherV2Impl, greaterImplCPU: shared.SimpleBinaryKernelImpl, lessImplCPU: shared.SimpleBinaryKernelImpl, linSpaceImplCPU: typeof shared.linSpaceImpl, logImplCPU: SimpleUnaryImpl, maxImplCPU: typeof shared.maxImpl, maximumImplCPU: shared.SimpleBinaryKernelImpl, minimumImplCPU: shared.SimpleBinaryKernelImpl, multiplyImplCPU: shared.SimpleBinaryKernelImpl, negImplCPU: typeof shared.negImpl, prodImplCPU: typeof shared.prodImpl, rangeImplCPU: typeof shared.rangeImpl, rsqrtImplCPU: SimpleUnaryImpl, simpleAbsImplCPU: typeof shared.simpleAbsImpl, sliceImplCPU: typeof shared.sliceImpl, stridedSliceImplCPU: typeof shared.stridedSliceImpl, subImplCPU: shared.SimpleBinaryKernelImpl, tileImplCPU: typeof shared.tileImpl, topKImplCPU: typeof shared.topKImpl, transposeImplCPU: typeof shared.transposeImpl, uniqueImplCPU: typeof shared.uniqueImpl;
export { addImplCPU, bincountImplCPU, bincountReduceImplCPU, ceilImplCPU, concatImplCPU, expImplCPU, expm1ImplCPU, floorImplCPU, gatherV2ImplCPU, greaterImplCPU, lessImplCPU, linSpaceImplCPU, logImplCPU, maxImplCPU, maximumImplCPU, minimumImplCPU, multiplyImplCPU, negImplCPU, prodImplCPU, simpleAbsImplCPU, sliceImplCPU, stridedSliceImplCPU, subImplCPU, rangeImplCPU, rsqrtImplCPU, tileImplCPU, topKImplCPU, transposeImplCPU, uniqueImplCPU, };
