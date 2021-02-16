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
import { ENGINE } from '../engine';
import { dispose, tidy } from '../globals';
import { add } from '../ops/add';
import { div } from '../ops/div';
import { mul } from '../ops/mul';
import { sqrt } from '../ops/ops';
import { square } from '../ops/square';
import { zerosLike } from '../ops/zeros_like';
import { registerClass } from '../serialization';
import { Optimizer } from './optimizer';
/** @doclink Optimizer */
export class AdadeltaOptimizer extends Optimizer {
    constructor(learningRate, rho, epsilon = null) {
        super();
        this.learningRate = learningRate;
        this.rho = rho;
        this.epsilon = epsilon;
        this.accumulatedGrads = [];
        this.accumulatedUpdates = [];
        if (epsilon == null) {
            this.epsilon = ENGINE.backend.epsilon();
        }
    }
    applyGradients(variableGradients) {
        const variableNames = Array.isArray(variableGradients) ?
            variableGradients.map(item => item.name) :
            Object.keys(variableGradients);
        variableNames.forEach((name, i) => {
            const value = ENGINE.registeredVariables[name];
            const trainable = false;
            if (this.accumulatedGrads[i] == null) {
                this.accumulatedGrads[i] = {
                    originalName: `${name}/accum_grad`,
                    variable: tidy(() => zerosLike(value).variable(trainable))
                };
            }
            if (this.accumulatedUpdates[i] == null) {
                this.accumulatedUpdates[i] = {
                    originalName: `${name}/accum_var`,
                    variable: tidy(() => zerosLike(value).variable(trainable))
                };
            }
            const gradient = Array.isArray(variableGradients) ?
                variableGradients[i].tensor :
                variableGradients[name];
            if (gradient == null) {
                return;
            }
            const accumulatedGrad = this.accumulatedGrads[i].variable;
            const accumulatedUpdate = this.accumulatedUpdates[i].variable;
            tidy(() => {
                const newAccumulatedGrad = add(mul(accumulatedGrad, this.rho), mul(square(gradient), 1 - this.rho));
                const updates = mul(div(sqrt(add(accumulatedUpdate, this.epsilon)), sqrt(add(accumulatedGrad, this.epsilon))), gradient);
                const newAccumulatedUpdate = add(mul(accumulatedUpdate, this.rho), mul(square(updates), 1 - this.rho));
                accumulatedGrad.assign(newAccumulatedGrad);
                accumulatedUpdate.assign(newAccumulatedUpdate);
                const newValue = add(mul(updates, -this.learningRate), value);
                value.assign(newValue);
            });
        });
        this.incrementIterations();
    }
    dispose() {
        if (this.accumulatedUpdates != null) {
            dispose(this.accumulatedGrads.map(v => v.variable));
            dispose(this.accumulatedUpdates.map(v => v.variable));
        }
    }
    async getWeights() {
        // Order matters for Python compatibility.
        const variables = [...this.accumulatedGrads, ...this.accumulatedUpdates];
        return [await this.saveIterations()].concat(variables.map(v => ({ name: v.originalName, tensor: v.variable })));
    }
    async setWeights(weightValues) {
        weightValues = await this.extractIterations(weightValues);
        const variableCount = weightValues.length / 2;
        const trainable = false;
        this.accumulatedGrads =
            weightValues.slice(0, variableCount).map(v => ({
                originalName: v.name,
                variable: v.tensor.variable(trainable)
            }));
        this.accumulatedUpdates =
            weightValues.slice(variableCount, variableCount * 2)
                .map(v => ({
                originalName: v.name,
                variable: v.tensor.variable(trainable)
            }));
    }
    getConfig() {
        return {
            'learningRate': this.learningRate,
            'rho': this.rho,
            'epsilon': this.epsilon
        };
    }
    /** @nocollapse */
    static fromConfig(cls, config) {
        return new cls(config['learningRate'], config['rho'], config['epsilon']);
    }
}
/** @nocollapse */
AdadeltaOptimizer.className = 'Adadelta'; // Name matters for Python compatibility.
registerClass(AdadeltaOptimizer);
//# sourceMappingURL=adadelta_optimizer.js.map