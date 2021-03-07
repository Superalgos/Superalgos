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
 * TensorFlow.js Layers: Basic Layers.
 */
import { any, notEqual, serialization, tidy, transpose, util } from '@tensorflow/tfjs-core';
import { getActivation, serializeActivation } from '../activations';
import * as K from '../backend/tfjs_backend';
import { getConstraint, serializeConstraint } from '../constraints';
import { InputSpec, Layer } from '../engine/topology';
import { ValueError } from '../errors';
import { getInitializer, serializeInitializer } from '../initializers';
import { getRegularizer, serializeRegularizer } from '../regularizers';
import { assertPositiveInteger, mapActivationToFusedKernel } from '../utils/generic_utils';
import { arrayProd, range } from '../utils/math_utils';
import { getExactlyOneShape, getExactlyOneTensor } from '../utils/types_utils';
export class Dropout extends Layer {
    constructor(args) {
        super(args);
        this.rate = Math.max(Math.min(args.rate, 1), 0);
        // So that the scalar doesn't get tidied up between executions.
        this.noiseShape = args.noiseShape;
        this.seed = args.seed;
        this.supportsMasking = true;
    }
    getNoiseShape(input) {
        if (this.noiseShape == null) {
            return this.noiseShape;
        }
        const inputShape = input.shape;
        const noiseShape = [];
        for (let i = 0; i < this.noiseShape.length; ++i) {
            noiseShape.push(this.noiseShape[i] == null ? inputShape[i] : this.noiseShape[i]);
        }
        return noiseShape;
    }
    call(inputs, kwargs) {
        return tidy(() => {
            this.invokeCallHook(inputs, kwargs);
            const input = getExactlyOneTensor(inputs);
            if (0 < this.rate && this.rate < 1) {
                const training = kwargs['training'] == null ? false : kwargs['training'];
                const noiseShape = this.getNoiseShape(input);
                const output = K.inTrainPhase(() => K.dropout(input, this.rate, noiseShape, this.seed), () => input, training);
                return output;
            }
            return inputs;
        });
    }
    getConfig() {
        const config = {
            rate: this.rate,
            noiseShape: this.noiseShape,
            seed: this.seed,
        };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
    dispose() {
        return super.dispose();
    }
}
/** @nocollapse */
Dropout.className = 'Dropout';
serialization.registerClass(Dropout);
export class SpatialDropout1D extends Dropout {
    constructor(args) {
        super(args);
        this.inputSpec = [{ ndim: 3 }];
    }
    getNoiseShape(input) {
        const inputShape = input.shape;
        return [inputShape[0], 1, inputShape[2]];
    }
}
/** @nocollapse */
SpatialDropout1D.className = 'SpatialDropout1D';
serialization.registerClass(SpatialDropout1D);
export class Dense extends Layer {
    constructor(args) {
        super(args);
        // Default activation: Linear (none).
        this.activation = null;
        this.useBias = true;
        this.kernel = null;
        this.bias = null;
        this.DEFAULT_KERNEL_INITIALIZER = 'glorotNormal';
        this.DEFAULT_BIAS_INITIALIZER = 'zeros';
        if (args.batchInputShape == null && args.inputShape == null &&
            args.inputDim != null) {
            // This logic is copied from Layer's constructor, since we can't
            // do exactly what the Python constructor does for Dense().
            let batchSize = null;
            if (args.batchSize != null) {
                batchSize = args.batchSize;
            }
            this.batchInputShape = [batchSize, args.inputDim];
        }
        this.units = args.units;
        assertPositiveInteger(this.units, 'units');
        this.activation = getActivation(args.activation);
        if (args.useBias != null) {
            this.useBias = args.useBias;
        }
        this.kernelInitializer = getInitializer(args.kernelInitializer || this.DEFAULT_KERNEL_INITIALIZER);
        this.biasInitializer =
            getInitializer(args.biasInitializer || this.DEFAULT_BIAS_INITIALIZER);
        this.kernelConstraint = getConstraint(args.kernelConstraint);
        this.biasConstraint = getConstraint(args.biasConstraint);
        this.kernelRegularizer = getRegularizer(args.kernelRegularizer);
        this.biasRegularizer = getRegularizer(args.biasRegularizer);
        this.activityRegularizer = getRegularizer(args.activityRegularizer);
        this.supportsMasking = true;
        this.inputSpec = [{ minNDim: 2 }];
    }
    build(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        const inputLastDim = inputShape[inputShape.length - 1];
        if (this.kernel == null) {
            this.kernel = this.addWeight('kernel', [inputLastDim, this.units], null, this.kernelInitializer, this.kernelRegularizer, true, this.kernelConstraint);
            if (this.useBias) {
                this.bias = this.addWeight('bias', [this.units], null, this.biasInitializer, this.biasRegularizer, true, this.biasConstraint);
            }
        }
        this.inputSpec = [{ minNDim: 2, axes: { [-1]: inputLastDim } }];
        this.built = true;
    }
    computeOutputShape(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        const outputShape = inputShape.slice();
        outputShape[outputShape.length - 1] = this.units;
        return outputShape;
    }
    call(inputs, kwargs) {
        return tidy(() => {
            this.invokeCallHook(inputs, kwargs);
            // Dense layer accepts only a single input.
            const input = getExactlyOneTensor(inputs);
            const fusedActivationName = mapActivationToFusedKernel(this.activation.getClassName());
            let output;
            if (fusedActivationName != null) {
                output = K.dot(input, this.kernel.read(), fusedActivationName, this.bias ? this.bias.read() : null);
            }
            else {
                output = K.dot(input, this.kernel.read());
                if (this.bias != null) {
                    output = K.biasAdd(output, this.bias.read());
                }
                if (this.activation != null) {
                    output = this.activation.apply(output);
                }
            }
            return output;
        });
    }
    getConfig() {
        const config = {
            units: this.units,
            activation: serializeActivation(this.activation),
            useBias: this.useBias,
            kernelInitializer: serializeInitializer(this.kernelInitializer),
            biasInitializer: serializeInitializer(this.biasInitializer),
            kernelRegularizer: serializeRegularizer(this.kernelRegularizer),
            biasRegularizer: serializeRegularizer(this.biasRegularizer),
            activityRegularizer: serializeRegularizer(this.activityRegularizer),
            kernelConstraint: serializeConstraint(this.kernelConstraint),
            biasConstraint: serializeConstraint(this.biasConstraint)
        };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
Dense.className = 'Dense';
serialization.registerClass(Dense);
export class Flatten extends Layer {
    constructor(args) {
        args = args || {};
        super(args);
        this.inputSpec = [{ minNDim: 3 }];
        this.dataFormat = args.dataFormat;
    }
    computeOutputShape(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        for (const dim of inputShape.slice(1)) {
            if (dim == null) {
                throw new ValueError(`The shape of the input to "Flatten" is not fully defined ` +
                    `(got ${inputShape.slice(1)}). Make sure to pass a complete ` +
                    `"input_shape" or "batch_input_shape" argument to the first ` +
                    `layer in your model.`);
            }
        }
        return [inputShape[0], arrayProd(inputShape, 1)];
    }
    call(inputs, kwargs) {
        return tidy(() => {
            this.invokeCallHook(inputs, kwargs);
            let input = getExactlyOneTensor(inputs);
            if (this.dataFormat === 'channelsFirst' && input.rank > 1) {
                const permutation = [0];
                for (let i = 2; i < input.rank; ++i) {
                    permutation.push(i);
                }
                permutation.push(1);
                input = input.transpose(permutation);
            }
            return K.batchFlatten(input);
        });
    }
    getConfig() {
        const config = {};
        if (this.dataFormat != null) {
            config['dataFormat'] = this.dataFormat;
        }
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
Flatten.className = 'Flatten';
serialization.registerClass(Flatten);
export class Activation extends Layer {
    constructor(args) {
        super(args);
        this.supportsMasking = true;
        this.activation = getActivation(args.activation);
    }
    call(inputs, kwargs) {
        return tidy(() => {
            this.invokeCallHook(inputs, kwargs);
            const input = getExactlyOneTensor(inputs);
            return this.activation.apply(input);
        });
    }
    getConfig() {
        const config = { activation: serializeActivation(this.activation) };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
Activation.className = 'Activation';
serialization.registerClass(Activation);
export class RepeatVector extends Layer {
    constructor(args) {
        super(args);
        this.n = args.n;
        this.inputSpec = [{ ndim: 2 }];
    }
    computeOutputShape(inputShape) {
        return [inputShape[0], this.n, inputShape[1]];
    }
    call(inputs, kwargs) {
        return tidy(() => {
            inputs = getExactlyOneTensor(inputs);
            return K.repeat(inputs, this.n);
        });
    }
    getConfig() {
        const config = {
            n: this.n,
        };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
RepeatVector.className = 'RepeatVector';
serialization.registerClass(RepeatVector);
export class Reshape extends Layer {
    constructor(args) {
        super(args);
        this.targetShape = args.targetShape;
        // Make sure that all unknown dimensions are represented as `null`.
        for (let i = 0; i < this.targetShape.length; ++i) {
            if (this.isUnknown(this.targetShape[i])) {
                this.targetShape[i] = null;
            }
        }
    }
    isUnknown(dim) {
        return dim < 0 || dim == null;
    }
    /**
     * Finds and replaces a missing dimension in output shape.
     *
     * This is a near direct port of the internal Numpy function
     * `_fix_unknown_dimension` in `numpy/core/src/multiarray/shape.c`.
     *
     * @param inputShape: Original shape of array begin reshape.
     * @param outputShape: Target shape of the array, with at most a single
     * `null` or negative number, which indicates an underdetermined dimension
     * that should be derived from `inputShape` and the known dimensions of
     *   `outputShape`.
     * @returns: The output shape with `null` replaced with its computed value.
     * @throws: ValueError: If `inputShape` and `outputShape` do not match.
     */
    fixUnknownDimension(inputShape, outputShape) {
        const errorMsg = 'Total size of new array must be unchanged.';
        const finalShape = outputShape.slice();
        let known = 1;
        let unknown = null;
        for (let i = 0; i < finalShape.length; ++i) {
            const dim = finalShape[i];
            if (this.isUnknown(dim)) {
                if (unknown === null) {
                    unknown = i;
                }
                else {
                    throw new ValueError('Can only specifiy one unknown dimension.');
                }
            }
            else {
                known *= dim;
            }
        }
        const originalSize = arrayProd(inputShape);
        if (unknown !== null) {
            if (known === 0 || originalSize % known !== 0) {
                throw new ValueError(errorMsg);
            }
            finalShape[unknown] = originalSize / known;
        }
        else if (originalSize !== known) {
            throw new ValueError(errorMsg);
        }
        return finalShape;
    }
    computeOutputShape(inputShape) {
        let anyUnknownDims = false;
        for (let i = 0; i < inputShape.length; ++i) {
            if (this.isUnknown(inputShape[i])) {
                anyUnknownDims = true;
                break;
            }
        }
        if (anyUnknownDims) {
            return inputShape.slice(0, 1).concat(this.targetShape);
        }
        else {
            return inputShape.slice(0, 1).concat(this.fixUnknownDimension(inputShape.slice(1), this.targetShape));
        }
    }
    call(inputs, kwargs) {
        return tidy(() => {
            this.invokeCallHook(inputs, kwargs);
            const input = getExactlyOneTensor(inputs);
            const inputShape = input.shape;
            const outputShape = inputShape.slice(0, 1).concat(this.fixUnknownDimension(inputShape.slice(1), this.targetShape));
            return input.reshape(outputShape);
        });
    }
    getConfig() {
        const config = {
            targetShape: this.targetShape,
        };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
Reshape.className = 'Reshape';
serialization.registerClass(Reshape);
export class Permute extends Layer {
    constructor(args) {
        super(args);
        if (args.dims == null) {
            throw new Error('Required configuration field `dims` is missing during Permute ' +
                'constructor call.');
        }
        if (!Array.isArray(args.dims)) {
            throw new Error('Permute constructor requires `dims` to be an Array, but received ' +
                `${args.dims} instead.`);
        }
        // Check the validity of the permutation indices.
        const expectedSortedIndices = range(1, args.dims.length + 1);
        if (!util.arraysEqual(args.dims.slice().sort(), expectedSortedIndices)) {
            throw new Error('Invalid permutation `dims`: ' + JSON.stringify(args.dims) +
                ' `dims` must contain consecutive integers starting from 1.');
        }
        this.dims = args.dims;
        this.dimsIncludingBatch = [0].concat(this.dims);
        this.inputSpec = [new InputSpec({ ndim: this.dims.length + 1 })];
    }
    computeOutputShape(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        const outputShape = inputShape.slice();
        this.dims.forEach((dim, i) => {
            outputShape[i + 1] = inputShape[dim];
        });
        return outputShape;
    }
    call(inputs, kwargs) {
        return transpose(getExactlyOneTensor(inputs), this.dimsIncludingBatch);
    }
    getConfig() {
        const config = {
            dims: this.dims,
        };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
Permute.className = 'Permute';
serialization.registerClass(Permute);
export class Masking extends Layer {
    constructor(args) {
        super(args == null ? {} : args);
        this.supportsMasking = true;
        if (args != null) {
            this.maskValue = args.maskValue == null ? 0 : args.maskValue;
        }
        else {
            this.maskValue = 0;
        }
    }
    computeOutputShape(inputShape) {
        return inputShape;
    }
    getConfig() {
        const baseConfig = super.getConfig();
        const config = { maskValue: this.maskValue };
        Object.assign(config, baseConfig);
        return config;
    }
    computeMask(inputs, mask) {
        const input = getExactlyOneTensor(inputs);
        const axis = -1;
        return any(notEqual(input, this.maskValue), axis);
    }
    call(inputs, kwargs) {
        return tidy(() => {
            this.invokeCallHook(inputs, kwargs);
            const input = getExactlyOneTensor(inputs);
            const axis = -1;
            const keepDims = true;
            const booleanMask = any(notEqual(input, this.maskValue), axis, keepDims);
            const output = input.mul(booleanMask.asType(input.dtype));
            return output;
        });
    }
}
/** @nocollapse */
Masking.className = 'Masking';
serialization.registerClass(Masking);
//# sourceMappingURL=core.js.map