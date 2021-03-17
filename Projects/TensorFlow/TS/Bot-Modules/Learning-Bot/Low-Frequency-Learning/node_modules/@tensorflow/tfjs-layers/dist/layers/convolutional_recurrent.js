/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as tfc from '@tensorflow/tfjs-core';
import { util } from '@tensorflow/tfjs-core';
import * as K from '../backend/tfjs_backend';
import { checkDataFormat, checkPaddingMode } from '../common';
import { InputSpec } from '../engine/topology';
import { AttributeError, NotImplementedError, ValueError } from '../errors';
import { Initializer } from '../initializers';
import { convOutputLength, normalizeArray } from '../utils/conv_utils';
import { assertPositiveInteger } from '../utils/generic_utils';
import { getExactlyOneShape } from '../utils/types_utils';
import { generateDropoutMask, LSTMCell, RNN, RNNCell } from './recurrent';
class ConvRNN2DCell extends RNNCell {
}
/**
 * Base class for convolutional-recurrent layers.
 */
class ConvRNN2D extends RNN {
    constructor(args) {
        if (args.unroll) {
            throw new NotImplementedError('Unrolling is not possible with convolutional RNNs.');
        }
        if (Array.isArray(args.cell)) {
            throw new NotImplementedError('It is not possible at the moment to stack convolutional cells.');
        }
        super(args);
        this.inputSpec = [new InputSpec({ ndim: 5 })];
    }
    call(inputs, kwargs) {
        return tfc.tidy(() => {
            if (this.cell.dropoutMask != null) {
                tfc.dispose(this.cell.dropoutMask);
                this.cell.dropoutMask = null;
            }
            if (this.cell.recurrentDropoutMask != null) {
                tfc.dispose(this.cell.recurrentDropoutMask);
                this.cell.recurrentDropoutMask = null;
            }
            if (kwargs && kwargs['constants']) {
                throw new ValueError('ConvRNN2D cell does not support constants');
            }
            const mask = kwargs == null ? null : kwargs['mask'];
            const training = kwargs == null ? null : kwargs['training'];
            const initialState = kwargs == null ? null : kwargs['initialState'];
            return super.call(inputs, { mask, training, initialState });
        });
    }
    computeOutputShape(inputShape) {
        let outShape = this.computeSingleOutputShape(inputShape);
        if (!this.returnSequences) {
            outShape = [outShape[0], ...outShape.slice(2)];
        }
        if (this.returnState) {
            outShape =
                [outShape, ...Array(2).fill([inputShape[0], ...outShape.slice(-3)])];
        }
        return outShape;
    }
    getInitialState(inputs) {
        return tfc.tidy(() => {
            const { stateSize } = this.cell;
            const inputShape = inputs.shape;
            const outputShape = this.computeSingleOutputShape(inputShape);
            const stateShape = [outputShape[0], ...outputShape.slice(2)];
            const initialState = tfc.zeros(stateShape);
            if (Array.isArray(stateSize)) {
                return Array(stateSize.length).fill(initialState);
            }
            return [initialState];
        });
    }
    resetStates(states, training = false) {
        tfc.tidy(() => {
            if (!this.stateful) {
                throw new AttributeError('Cannot call resetStates() on an RNN Layer that is not stateful.');
            }
            const inputShape = this.inputSpec[0].shape;
            const outputShape = this.computeSingleOutputShape(inputShape);
            const stateShape = [outputShape[0], ...outputShape.slice(2)];
            const batchSize = inputShape[0];
            if (batchSize == null) {
                throw new ValueError('If an RNN is stateful, it needs to know its batch size. Specify ' +
                    'the batch size of your input tensors: \n' +
                    '- If using a Sequential model, specify the batch size by ' +
                    'passing a `batchInputShape` option to your first layer.\n' +
                    '- If using the functional API, specify the batch size by ' +
                    'passing a `batchShape` option to your Input layer.');
            }
            // Initialize state if null.
            if (this.getStates() == null) {
                if (Array.isArray(this.cell.stateSize)) {
                    this.states_ = this.cell.stateSize.map(() => tfc.zeros(stateShape));
                }
                else {
                    this.states_ = [tfc.zeros(stateShape)];
                }
            }
            else if (states == null) {
                // Dispose old state tensors.
                tfc.dispose(this.states_);
                // For stateful RNNs, fully dispose kept old states.
                if (this.keptStates != null) {
                    tfc.dispose(this.keptStates);
                    this.keptStates = [];
                }
                if (Array.isArray(this.cell.stateSize)) {
                    this.states_ = this.cell.stateSize.map(() => tfc.zeros(stateShape));
                }
                else {
                    this.states_[0] = tfc.zeros(stateShape);
                }
            }
            else {
                if (!Array.isArray(states)) {
                    states = [states];
                }
                if (states.length !== this.states_.length) {
                    throw new ValueError(`Layer ${this.name} expects ${this.states_.length} state(s), ` +
                        `but it received ${states.length} state value(s). Input ` +
                        `received: ${states}`);
                }
                if (training) {
                    // Store old state tensors for complete disposal later, i.e., during
                    // the next no-arg call to this method. We do not dispose the old
                    // states immediately because that BPTT (among other things) require
                    // them.
                    this.keptStates.push(this.states_.slice());
                }
                else {
                    tfc.dispose(this.states_);
                }
                for (let index = 0; index < this.states_.length; ++index) {
                    const value = states[index];
                    const expectedShape = stateShape;
                    if (!util.arraysEqual(value.shape, expectedShape)) {
                        throw new ValueError(`State ${index} is incompatible with layer ${this.name}: ` +
                            `expected shape=${expectedShape}, received shape=${value.shape}`);
                    }
                    this.states_[index] = value;
                }
            }
            this.states_ = this.states_.map(state => tfc.keep(state.clone()));
        });
    }
    computeSingleOutputShape(inputShape) {
        const { dataFormat, filters, kernelSize, padding, strides, dilationRate } = this.cell;
        const isChannelsFirst = dataFormat === 'channelsFirst';
        const h = inputShape[isChannelsFirst ? 3 : 2];
        const w = inputShape[isChannelsFirst ? 4 : 3];
        const hOut = convOutputLength(h, kernelSize[0], padding, strides[0], dilationRate[0]);
        const wOut = convOutputLength(w, kernelSize[1], padding, strides[1], dilationRate[1]);
        const outShape = [
            ...inputShape.slice(0, 2),
            ...(isChannelsFirst ? [filters, hOut, wOut] : [hOut, wOut, filters])
        ];
        return outShape;
    }
}
/** @nocollapse */
ConvRNN2D.className = 'ConvRNN2D';
export class ConvLSTM2DCell extends LSTMCell {
    constructor(args) {
        const { filters, kernelSize, strides, padding, dataFormat, dilationRate, } = args;
        super(Object.assign({}, args, { units: filters }));
        this.filters = filters;
        assertPositiveInteger(this.filters, 'filters');
        this.kernelSize = normalizeArray(kernelSize, 2, 'kernelSize');
        this.kernelSize.forEach(size => assertPositiveInteger(size, 'kernelSize'));
        this.strides = normalizeArray(strides || 1, 2, 'strides');
        this.strides.forEach(stride => assertPositiveInteger(stride, 'strides'));
        this.padding = padding || 'valid';
        checkPaddingMode(this.padding);
        this.dataFormat = dataFormat || 'channelsLast';
        checkDataFormat(this.dataFormat);
        this.dilationRate = normalizeArray(dilationRate || 1, 2, 'dilationRate');
        this.dilationRate.forEach(rate => assertPositiveInteger(rate, 'dilationRate'));
    }
    build(inputShape) {
        var _a;
        inputShape = getExactlyOneShape(inputShape);
        const channelAxis = this.dataFormat === 'channelsFirst' ? 1 : inputShape.length - 1;
        if (inputShape[channelAxis] == null) {
            throw new ValueError(`The channel dimension of the input should be defined. ` +
                `Found ${inputShape[channelAxis]}`);
        }
        const inputDim = inputShape[channelAxis];
        const numOfKernels = 4;
        const kernelShape = this.kernelSize.concat([inputDim, this.filters * numOfKernels]);
        this.kernel = this.addWeight('kernel', kernelShape, null, this.kernelInitializer, this.kernelRegularizer, true, this.kernelConstraint);
        const recurrentKernelShape = this.kernelSize.concat([this.filters, this.filters * numOfKernels]);
        this.recurrentKernel = this.addWeight('recurrent_kernel', recurrentKernelShape, null, this.recurrentInitializer, this.recurrentRegularizer, true, this.recurrentConstraint);
        if (this.useBias) {
            let biasInitializer;
            if (this.unitForgetBias) {
                const init = this.biasInitializer;
                const filters = this.filters;
                biasInitializer = new (_a = class CustomInit extends Initializer {
                        apply(shape, dtype) {
                            const biasI = init.apply([filters]);
                            const biasF = tfc.ones([filters]);
                            const biasCAndO = init.apply([filters * 2]);
                            return K.concatenate([biasI, biasF, biasCAndO]);
                        }
                    },
                    /** @nocollapse */
                    _a.className = 'CustomInit',
                    _a)();
            }
            else {
                biasInitializer = this.biasInitializer;
            }
            this.bias = this.addWeight('bias', [this.filters * numOfKernels], null, biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        this.built = true;
    }
    call(inputs, kwargs) {
        return tfc.tidy(() => {
            if (inputs.length !== 3) {
                throw new ValueError(`ConvLSTM2DCell expects 3 input Tensors (inputs, h, c), got ` +
                    `${inputs.length}.`);
            }
            const training = kwargs['training'] || false;
            const x = inputs[0]; // Current input
            const hTMinus1 = inputs[1]; // Previous memory state.
            const cTMinus1 = inputs[2]; // Previous carry state.
            const numOfKernels = 4;
            if (0 < this.dropout && this.dropout < 1 && this.dropoutMask == null) {
                this.dropoutMask = generateDropoutMask({
                    ones: () => tfc.onesLike(x),
                    rate: this.dropout,
                    training,
                    count: numOfKernels
                });
            }
            const dropoutMask = this.dropoutMask;
            const applyDropout = (x, mask, index) => {
                if (!mask || !mask[index]) {
                    return x;
                }
                return tfc.mul(mask[index], x);
            };
            let xI = applyDropout(x, dropoutMask, 0);
            let xF = applyDropout(x, dropoutMask, 1);
            let xC = applyDropout(x, dropoutMask, 2);
            let xO = applyDropout(x, dropoutMask, 3);
            if (0 < this.recurrentDropout && this.recurrentDropout < 1 &&
                this.recurrentDropoutMask == null) {
                this.recurrentDropoutMask = generateDropoutMask({
                    ones: () => tfc.onesLike(hTMinus1),
                    rate: this.recurrentDropout,
                    training,
                    count: numOfKernels
                });
            }
            const recDropoutMask = this.recurrentDropoutMask;
            let hI = applyDropout(hTMinus1, recDropoutMask, 0);
            let hF = applyDropout(hTMinus1, recDropoutMask, 1);
            let hC = applyDropout(hTMinus1, recDropoutMask, 2);
            let hO = applyDropout(hTMinus1, recDropoutMask, 3);
            const kernelChannelAxis = 3;
            const [kernelI, kernelF, kernelC, kernelO] = tfc.split(this.kernel.read(), numOfKernels, kernelChannelAxis);
            const [biasI, biasF, biasC, biasO] = this.useBias ?
                tfc.split(this.bias.read(), numOfKernels) :
                [null, null, null, null];
            xI = this.inputConv(xI, kernelI, biasI, this.padding);
            xF = this.inputConv(xF, kernelF, biasF, this.padding);
            xC = this.inputConv(xC, kernelC, biasC, this.padding);
            xO = this.inputConv(xO, kernelO, biasO, this.padding);
            const [recKernelI, recKernelF, recKernelC, recKernelO] = tfc.split(this.recurrentKernel.read(), numOfKernels, kernelChannelAxis);
            hI = this.recurrentConv(hI, recKernelI);
            hF = this.recurrentConv(hF, recKernelF);
            hC = this.recurrentConv(hC, recKernelC);
            hO = this.recurrentConv(hO, recKernelO);
            const i = this.recurrentActivation.apply(tfc.add(xI, hI));
            const f = this.recurrentActivation.apply(tfc.add(xF, hF));
            const c = tfc.add(tfc.mul(f, cTMinus1), tfc.mul(i, this.activation.apply(tfc.add(xC, hC))));
            const h = tfc.mul(this.recurrentActivation.apply(tfc.add(xO, hO)), this.activation.apply(c));
            return [h, h, c];
        });
    }
    getConfig() {
        const _a = super.getConfig(), { 'units': _ } = _a, baseConfig = __rest(_a, ['units']);
        const config = {
            filters: this.filters,
            kernelSize: this.kernelSize,
            padding: this.padding,
            dataFormat: this.dataFormat,
            dilationRate: this.dilationRate,
            strides: this.strides,
        };
        return Object.assign({}, baseConfig, config);
    }
    inputConv(x, w, b, padding) {
        const out = tfc.conv2d(x, w, this.strides, (padding || 'valid'), this.dataFormat === 'channelsFirst' ? 'NCHW' : 'NHWC', this.dilationRate);
        if (b) {
            return K.biasAdd(out, b, this.dataFormat);
        }
        return out;
    }
    recurrentConv(x, w) {
        const strides = 1;
        return tfc.conv2d(x, w, strides, 'same', this.dataFormat === 'channelsFirst' ? 'NCHW' : 'NHWC');
    }
}
/** @nocollapse */
ConvLSTM2DCell.className = 'ConvLSTM2DCell';
tfc.serialization.registerClass(ConvLSTM2DCell);
export class ConvLSTM2D extends ConvRNN2D {
    constructor(args) {
        const cell = new ConvLSTM2DCell(args);
        super(Object.assign({}, args, { cell }));
    }
    /** @nocollapse */
    static fromConfig(cls, config) {
        return new cls(config);
    }
}
/** @nocollapse */
ConvLSTM2D.className = 'ConvLSTM2D';
tfc.serialization.registerClass(ConvLSTM2D);
//# sourceMappingURL=convolutional_recurrent.js.map