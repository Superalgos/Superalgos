/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/**
 *  Advanced activation layers.
 */
import { clipByValue, elu, leakyRelu, prelu, relu, serialization } from '@tensorflow/tfjs-core';
import { Softmax as softmaxActivation } from '../activations';
import { cast } from '../backend/tfjs_backend';
import { getConstraint, serializeConstraint } from '../constraints';
import { InputSpec, Layer } from '../engine/topology';
import { NotImplementedError, ValueError } from '../errors';
import { getInitializer, serializeInitializer } from '../initializers';
import { getRegularizer, serializeRegularizer } from '../regularizers';
import { getExactlyOneShape, getExactlyOneTensor } from '../utils/types_utils';
export class ReLU extends Layer {
    constructor(args) {
        super(args == null ? {} : args);
        this.supportsMasking = true;
        if (args != null) {
            this.maxValue = args.maxValue;
        }
    }
    call(inputs, kwargs) {
        inputs = getExactlyOneTensor(inputs);
        let output = relu(inputs);
        if (this.maxValue != null) {
            output = clipByValue(output, 0, this.maxValue);
        }
        return output;
    }
    computeOutputShape(inputShape) {
        return inputShape;
    }
    getConfig() {
        const config = { maxValue: this.maxValue };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
ReLU.className = 'ReLU';
serialization.registerClass(ReLU);
export class LeakyReLU extends Layer {
    constructor(args) {
        super(args == null ? {} : args);
        this.DEFAULT_ALPHA = 0.3;
        if (args == null) {
            args = {};
        }
        this.alpha = args.alpha == null ? this.DEFAULT_ALPHA : args.alpha;
    }
    call(inputs, kwargs) {
        const x = getExactlyOneTensor(inputs);
        return leakyRelu(x, this.alpha);
    }
    computeOutputShape(inputShape) {
        return inputShape;
    }
    getConfig() {
        const config = { alpha: this.alpha };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
LeakyReLU.className = 'LeakyReLU';
serialization.registerClass(LeakyReLU);
export class PReLU extends Layer {
    constructor(args) {
        super(args == null ? {} : args);
        this.DEFAULT_ALPHA_INITIALIZER = 'zeros';
        if (args == null) {
            args = {};
        }
        this.supportsMasking = true;
        this.alphaInitializer =
            getInitializer(args.alphaInitializer || this.DEFAULT_ALPHA_INITIALIZER);
        this.alphaRegularizer = getRegularizer(args.alphaRegularizer);
        this.alphaConstraint = getConstraint(args.alphaConstraint);
        if (args.sharedAxes == null) {
            this.sharedAxes = null;
        }
        else if (Array.isArray(args.sharedAxes)) {
            this.sharedAxes = args.sharedAxes;
        }
        else if (typeof args.sharedAxes === 'number') {
            this.sharedAxes = [args.sharedAxes];
        }
        else {
            throw new ValueError(`Expected sharedAxes to be a number or an array of numbers, ` +
                `but got ${args.sharedAxes}`);
        }
    }
    build(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        const paramShape = inputShape.slice(1);
        if (this.sharedAxes != null) {
            for (const i of this.sharedAxes) {
                paramShape[i - 1] = 1;
            }
        }
        this.alpha = this.addWeight('alpha', paramShape, 'float32', this.alphaInitializer, this.alphaRegularizer, true, this.alphaConstraint);
        // Set input spec.
        const axes = {};
        if (this.sharedAxes != null) {
            for (let i = 1; i < inputShape.length; ++i) {
                axes[i] = inputShape[i];
            }
        }
        this.inputSpec = [new InputSpec({
                ndim: inputShape.length,
                axes,
            })];
        this.built = true;
    }
    call(inputs, kwargs) {
        inputs = getExactlyOneTensor(inputs);
        return prelu(inputs, this.alpha.read());
    }
    getConfig() {
        const config = {
            alphaInitializer: serializeInitializer(this.alphaInitializer),
            alphaRegularizer: serializeRegularizer(this.alphaRegularizer),
            alphaConstraint: serializeConstraint(this.alphaConstraint),
            sharedAxes: this.sharedAxes
        };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
PReLU.className = 'PReLU';
serialization.registerClass(PReLU);
export class ELU extends Layer {
    constructor(args) {
        super(args == null ? {} : args);
        this.DEFAULT_ALPHA = 1.0;
        if (args == null) {
            args = {};
        }
        if (args.alpha != null && args.alpha !== this.DEFAULT_ALPHA) {
            throw new NotImplementedError(`Non-default alpha value (${args.alpha}) is not supported by the ` +
                `ELU layer yet.`);
        }
        this.alpha = args.alpha == null ? this.DEFAULT_ALPHA : args.alpha;
    }
    call(inputs, kwargs) {
        const x = getExactlyOneTensor(inputs);
        return elu(x);
    }
    computeOutputShape(inputShape) {
        return inputShape;
    }
    getConfig() {
        const config = { alpha: this.alpha };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
ELU.className = 'ELU';
serialization.registerClass(ELU);
export class ThresholdedReLU extends Layer {
    constructor(args) {
        super(args == null ? {} : args);
        this.DEFAULT_THETA = 1.0;
        if (args == null) {
            args = {};
        }
        this.theta = args.theta == null ? this.DEFAULT_THETA : args.theta;
    }
    call(inputs, kwargs) {
        const x = getExactlyOneTensor(inputs);
        return x.mul(cast(x.greater(this.theta), 'float32'));
    }
    computeOutputShape(inputShape) {
        return inputShape;
    }
    getConfig() {
        const config = { theta: this.theta };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
ThresholdedReLU.className = 'ThresholdedReLU';
serialization.registerClass(ThresholdedReLU);
export class Softmax extends Layer {
    constructor(args) {
        super(args == null ? {} : args);
        this.DEFAULT_AXIS = 1.0;
        if (args == null) {
            args = {};
        }
        this.softmax = new softmaxActivation().apply;
        this.axis = args.axis == null ? this.DEFAULT_AXIS : args.axis;
    }
    call(inputs, kwargs) {
        const x = getExactlyOneTensor(inputs);
        return this.softmax(x, this.axis);
    }
    computeOutputShape(inputShape) {
        return inputShape;
    }
    getConfig() {
        const config = { axis: this.axis };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
Softmax.className = 'Softmax';
serialization.registerClass(Softmax);
//# sourceMappingURL=advanced_activations.js.map