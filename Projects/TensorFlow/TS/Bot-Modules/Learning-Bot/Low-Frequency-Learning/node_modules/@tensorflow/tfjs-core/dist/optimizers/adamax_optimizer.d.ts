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
import { Optimizer } from './optimizer';
export declare class AdamaxOptimizer extends Optimizer {
    protected learningRate: number;
    protected beta1: number;
    protected beta2: number;
    protected epsilon: number;
    protected decay: number;
    /** @nocollapse */
    static className: string;
    private accBeta1;
    private iteration;
    private accumulatedFirstMoment;
    private accumulatedWeightedInfNorm;
    constructor(learningRate: number, beta1: number, beta2: number, epsilon?: number, decay?: number);
    applyGradients(variableGradients: NamedVariableMap | NamedTensor[]): void;
    dispose(): void;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    getConfig(): ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}
