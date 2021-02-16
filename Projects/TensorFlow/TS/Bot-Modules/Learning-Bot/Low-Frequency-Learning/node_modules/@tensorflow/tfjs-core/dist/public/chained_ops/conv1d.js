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
import { conv1d } from '../../ops/conv1d';
import { getGlobalTensorClass } from '../../tensor';
getGlobalTensorClass().prototype.conv1d = function (filter, stride, pad, dataFormat, dilation, dimRoundingMode) {
    this.throwIfDisposed();
    return conv1d(this, filter, stride, pad, dataFormat, dilation, dimRoundingMode);
};
//# sourceMappingURL=conv1d.js.map