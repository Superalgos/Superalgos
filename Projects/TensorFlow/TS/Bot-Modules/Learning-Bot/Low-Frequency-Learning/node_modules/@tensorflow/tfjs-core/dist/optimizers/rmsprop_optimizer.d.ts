/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
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
import { ConfigDict, Serializable, SerializableConstructor } from '../serialization';
import { NamedTensor, NamedTensorMap } from '../tensor_types';
import { Optimizer } from './optimizer';
/** @doclink Optimizer */
export declare class RMSPropOptimizer extends Optimizer {
    protected learningRate: number;
    protected decay: number;
    protected momentum: number;
    protected epsilon: number;
    /** @nocollapse */
    static className: string;
    private centered;
    private accumulatedMeanSquares;
    private accumulatedMoments;
    private accumulatedMeanGrads;
    constructor(learningRate: number, decay?: number, momentum?: number, epsilon?: number, centered?: boolean);
    applyGradients(variableGradients: NamedTensorMap | NamedTensor[]): void;
    dispose(): void;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    getConfig(): ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}
