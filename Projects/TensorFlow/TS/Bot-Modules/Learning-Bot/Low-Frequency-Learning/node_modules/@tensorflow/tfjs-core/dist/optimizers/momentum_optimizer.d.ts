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
import { NamedTensor, NamedVariableMap } from '../tensor_types';
import { SGDOptimizer } from './sgd_optimizer';
/** @doclink Optimizer */
export declare class MomentumOptimizer extends SGDOptimizer {
    protected learningRate: number;
    private momentum;
    private useNesterov;
    /** @nocollapse */
    static className: string;
    private m;
    private accumulations;
    constructor(learningRate: number, momentum: number, useNesterov?: boolean);
    applyGradients(variableGradients: NamedVariableMap | NamedTensor[]): void;
    dispose(): void;
    /**
     * Sets the momentum of the optimizer.
     *
     * @param momentum
     */
    setMomentum(momentum: number): void;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    getConfig(): ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}
