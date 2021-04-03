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
 * TensorFlow.js Layers: Recurrent Neural Network Layers.
 */
import * as tfc from '@tensorflow/tfjs-core';
import { serialization, tidy, util } from '@tensorflow/tfjs-core';
import { getActivation, serializeActivation } from '../activations';
import * as K from '../backend/tfjs_backend';
import { nameScope } from '../common';
import { getConstraint, serializeConstraint } from '../constraints';
import { InputSpec, SymbolicTensor } from '../engine/topology';
import { Layer } from '../engine/topology';
import { AttributeError, NotImplementedError, ValueError } from '../errors';
import { getInitializer, Initializer, Ones, serializeInitializer } from '../initializers';
import { getRegularizer, serializeRegularizer } from '../regularizers';
import { assertPositiveInteger } from '../utils/generic_utils';
import * as math_utils from '../utils/math_utils';
import { getExactlyOneShape, getExactlyOneTensor, isArrayOfShapes } from '../utils/types_utils';
import { batchGetValue, batchSetValue } from '../variables';
import { deserialize } from './serialization';
/**
 * Standardize `apply()` args to a single list of tensor inputs.
 *
 * When running a model loaded from file, the input tensors `initialState` and
 * `constants` are passed to `RNN.apply()` as part of `inputs` instead of the
 * dedicated kwargs fields. `inputs` consists of
 * `[inputs, initialState0, initialState1, ..., constant0, constant1]` in this
 * case.
 * This method makes sure that arguments are
 * separated and that `initialState` and `constants` are `Array`s of tensors
 * (or None).
 *
 * @param inputs Tensor or `Array` of  tensors.
 * @param initialState Tensor or `Array` of tensors or `null`/`undefined`.
 * @param constants Tensor or `Array` of tensors or `null`/`undefined`.
 * @returns An object consisting of
 *   inputs: A tensor.
 *   initialState: `Array` of tensors or `null`.
 *   constants: `Array` of tensors or `null`.
 * @throws ValueError, if `inputs` is an `Array` but either `initialState` or
 *   `constants` is provided.
 */
export function standardizeArgs(inputs, initialState, constants, numConstants) {
    if (Array.isArray(inputs)) {
        if (initialState != null || constants != null) {
            throw new ValueError('When inputs is an array, neither initialState or constants ' +
                'should be provided');
        }
        if (numConstants != null) {
            constants = inputs.slice(inputs.length - numConstants, inputs.length);
            inputs = inputs.slice(0, inputs.length - numConstants);
        }
        if (inputs.length > 1) {
            initialState = inputs.slice(1, inputs.length);
        }
        inputs = inputs[0];
    }
    function toListOrNull(x) {
        if (x == null || Array.isArray(x)) {
            return x;
        }
        else {
            return [x];
        }
    }
    initialState = toListOrNull(initialState);
    constants = toListOrNull(constants);
    return { inputs, initialState, constants };
}
/**
 * Iterates over the time dimension of a tensor.
 *
 * @param stepFunction RNN step function.
 *   Parameters:
 *     inputs: tensor with shape `[samples, ...]` (no time dimension),
 *       representing input for the batch of samples at a certain time step.
 *     states: an Array of tensors.
 *   Returns:
 *     outputs: tensor with shape `[samples, outputDim]` (no time dimension).
 *     newStates: list of tensors, same length and shapes as `states`. The first
 *       state in the list must be the output tensor at the previous timestep.
 * @param inputs Tensor of temporal data of shape `[samples, time, ...]` (at
 *   least 3D).
 * @param initialStates Tensor with shape `[samples, outputDim]` (no time
 *   dimension), containing the initial values of the states used in the step
 *   function.
 * @param goBackwards If `true`, do the iteration over the time dimension in
 *   reverse order and return the reversed sequence.
 * @param mask Binary tensor with shape `[sample, time, 1]`, with a zero for
 *   every element that is masked.
 * @param constants An Array of constant values passed at each step.
 * @param unroll Whether to unroll the RNN or to use a symbolic loop. *Not*
 *   applicable to this imperative deeplearn.js backend. Its value is ignored.
 * @param needPerStepOutputs Whether the per-step outputs are to be
 *   concatenated into a single tensor and returned (as the second return
 *   value). Default: `false`. This arg is included so that the relatively
 *   expensive concatenation of the stepwise outputs can be omitted unless
 *   the stepwise outputs need to be kept (e.g., for an LSTM layer of which
 *   `returnSequence` is `true`.)
 * @returns An Array: `[lastOutput, outputs, newStates]`.
 *   lastOutput: the lastest output of the RNN, of shape `[samples, ...]`.
 *   outputs: tensor with shape `[samples, time, ...]` where each entry
 *     `output[s, t]` is the output of the step function at time `t` for sample
 *     `s`. This return value is provided if and only if the
 *     `needPerStepOutputs` is set as `true`. If it is set as `false`, this
 *     return value will be `undefined`.
 *   newStates: Array of tensors, latest states returned by the step function,
 *      of shape `(samples, ...)`.
 * @throws ValueError If input dimension is less than 3.
 *
 * TODO(nielsene): This needs to be tidy-ed.
 */
export function rnn(stepFunction, inputs, initialStates, goBackwards = false, mask, constants, unroll = false, needPerStepOutputs = false) {
    return tfc.tidy(() => {
        const ndim = inputs.shape.length;
        if (ndim < 3) {
            throw new ValueError(`Input should be at least 3D, but is ${ndim}D.`);
        }
        // Transpose to time-major, i.e., from [batch, time, ...] to [time, batch,
        // ...].
        const axes = [1, 0].concat(math_utils.range(2, ndim));
        inputs = tfc.transpose(inputs, axes);
        if (constants != null) {
            throw new NotImplementedError('The rnn() functoin of the deeplearn.js backend does not support ' +
                'constants yet.');
        }
        // Porting Note: the unroll option is ignored by the imperative backend.
        if (unroll) {
            console.warn('Backend rnn(): the unroll = true option is not applicable to the ' +
                'imperative deeplearn.js backend.');
        }
        if (mask != null) {
            mask = mask.asType('bool').asType('float32');
            if (mask.rank === ndim - 1) {
                mask = tfc.expandDims(mask, -1);
            }
            mask = tfc.transpose(mask, axes);
        }
        if (goBackwards) {
            inputs = tfc.reverse(inputs, 0);
            if (mask != null) {
                mask = tfc.reverse(mask, 0);
            }
        }
        // Porting Note: PyKeras with TensorFlow backend uses a symbolic loop
        //   (tf.while_loop). But for the imperative deeplearn.js backend, we just
        //   use the usual TypeScript control flow to iterate over the time steps in
        //   the inputs.
        // Porting Note: PyKeras patches a "_use_learning_phase" attribute to
        // outputs.
        //   This is not idiomatic in TypeScript. The info regarding whether we are
        //   in a learning (i.e., training) phase for RNN is passed in a different
        //   way.
        const perStepOutputs = [];
        let lastOutput;
        let states = initialStates;
        const timeSteps = inputs.shape[0];
        const perStepInputs = tfc.unstack(inputs);
        let perStepMasks;
        if (mask != null) {
            perStepMasks = tfc.unstack(mask);
        }
        for (let t = 0; t < timeSteps; ++t) {
            const currentInput = perStepInputs[t];
            const stepOutputs = tfc.tidy(() => stepFunction(currentInput, states));
            if (mask == null) {
                lastOutput = stepOutputs[0];
                states = stepOutputs[1];
            }
            else {
                const maskedOutputs = tfc.tidy(() => {
                    const stepMask = perStepMasks[t];
                    const negStepMask = tfc.onesLike(stepMask).sub(stepMask);
                    // TODO(cais): Would tfc.where() be better for performance?
                    const output = stepOutputs[0].mul(stepMask).add(states[0].mul(negStepMask));
                    const newStates = states.map((state, i) => {
                        return stepOutputs[1][i].mul(stepMask).add(state.mul(negStepMask));
                    });
                    return { output, newStates };
                });
                lastOutput = maskedOutputs.output;
                states = maskedOutputs.newStates;
            }
            if (needPerStepOutputs) {
                perStepOutputs.push(lastOutput);
            }
        }
        let outputs;
        if (needPerStepOutputs) {
            const axis = 1;
            outputs = tfc.stack(perStepOutputs, axis);
        }
        return [lastOutput, outputs, states];
    });
}
export class RNN extends Layer {
    constructor(args) {
        super(args);
        let cell;
        if (args.cell == null) {
            throw new ValueError('cell property is missing for the constructor of RNN.');
        }
        else if (Array.isArray(args.cell)) {
            cell = new StackedRNNCells({ cells: args.cell });
        }
        else {
            cell = args.cell;
        }
        if (cell.stateSize == null) {
            throw new ValueError('The RNN cell should have an attribute `stateSize` (tuple of ' +
                'integers, one integer per RNN state).');
        }
        this.cell = cell;
        this.returnSequences =
            args.returnSequences == null ? false : args.returnSequences;
        this.returnState = args.returnState == null ? false : args.returnState;
        this.goBackwards = args.goBackwards == null ? false : args.goBackwards;
        this._stateful = args.stateful == null ? false : args.stateful;
        this.unroll = args.unroll == null ? false : args.unroll;
        this.supportsMasking = true;
        this.inputSpec = [new InputSpec({ ndim: 3 })];
        this.stateSpec = null;
        this.states_ = null;
        // TODO(cais): Add constantsSpec and numConstants.
        this.numConstants = null;
        // TODO(cais): Look into the use of initial_state in the kwargs of the
        //   constructor.
        this.keptStates = [];
    }
    // Porting Note: This is the equivalent of `RNN.states` property getter in
    //   PyKeras.
    getStates() {
        if (this.states_ == null) {
            const numStates = Array.isArray(this.cell.stateSize) ? this.cell.stateSize.length : 1;
            return math_utils.range(0, numStates).map(x => null);
        }
        else {
            return this.states_;
        }
    }
    // Porting Note: This is the equivalent of the `RNN.states` property setter in
    //   PyKeras.
    setStates(states) {
        this.states_ = states;
    }
    computeOutputShape(inputShape) {
        if (isArrayOfShapes(inputShape)) {
            inputShape = inputShape[0];
        }
        inputShape = inputShape;
        // TODO(cais): Remove the casting once stacked RNN cells become supported.
        let stateSize = this.cell.stateSize;
        if (!Array.isArray(stateSize)) {
            stateSize = [stateSize];
        }
        const outputDim = stateSize[0];
        let outputShape;
        if (this.returnSequences) {
            outputShape = [inputShape[0], inputShape[1], outputDim];
        }
        else {
            outputShape = [inputShape[0], outputDim];
        }
        if (this.returnState) {
            const stateShape = [];
            for (const dim of stateSize) {
                stateShape.push([inputShape[0], dim]);
            }
            return [outputShape].concat(stateShape);
        }
        else {
            return outputShape;
        }
    }
    computeMask(inputs, mask) {
        return tfc.tidy(() => {
            if (Array.isArray(mask)) {
                mask = mask[0];
            }
            const outputMask = this.returnSequences ? mask : null;
            if (this.returnState) {
                const stateMask = this.states.map(s => null);
                return [outputMask].concat(stateMask);
            }
            else {
                return outputMask;
            }
        });
    }
    /**
     * Get the current state tensors of the RNN.
     *
     * If the state hasn't been set, return an array of `null`s of the correct
     * length.
     */
    get states() {
        if (this.states_ == null) {
            const numStates = Array.isArray(this.cell.stateSize) ? this.cell.stateSize.length : 1;
            const output = [];
            for (let i = 0; i < numStates; ++i) {
                output.push(null);
            }
            return output;
        }
        else {
            return this.states_;
        }
    }
    set states(s) {
        this.states_ = s;
    }
    build(inputShape) {
        // Note inputShape will be an Array of Shapes of initial states and
        // constants if these are passed in apply().
        const constantShape = null;
        if (this.numConstants != null) {
            throw new NotImplementedError('Constants support is not implemented in RNN yet.');
        }
        if (isArrayOfShapes(inputShape)) {
            inputShape = inputShape[0];
        }
        inputShape = inputShape;
        const batchSize = this.stateful ? inputShape[0] : null;
        const inputDim = inputShape.slice(2);
        this.inputSpec[0] = new InputSpec({ shape: [batchSize, null, ...inputDim] });
        // Allow cell (if RNNCell Layer) to build before we set or validate
        // stateSpec.
        const stepInputShape = [inputShape[0]].concat(inputShape.slice(2));
        if (constantShape != null) {
            throw new NotImplementedError('Constants support is not implemented in RNN yet.');
        }
        else {
            this.cell.build(stepInputShape);
        }
        // Set or validate stateSpec.
        let stateSize;
        if (Array.isArray(this.cell.stateSize)) {
            stateSize = this.cell.stateSize;
        }
        else {
            stateSize = [this.cell.stateSize];
        }
        if (this.stateSpec != null) {
            if (!util.arraysEqual(this.stateSpec.map(spec => spec.shape[spec.shape.length - 1]), stateSize)) {
                throw new ValueError(`An initialState was passed that is not compatible with ` +
                    `cell.stateSize. Received stateSpec=${this.stateSpec}; ` +
                    `However cell.stateSize is ${this.cell.stateSize}`);
            }
        }
        else {
            this.stateSpec =
                stateSize.map(dim => new InputSpec({ shape: [null, dim] }));
        }
        if (this.stateful) {
            this.resetStates();
        }
    }
    /**
     * Reset the state tensors of the RNN.
     *
     * If the `states` argument is `undefined` or `null`, will set the
     * state tensor(s) of the RNN to all-zero tensors of the appropriate
     * shape(s).
     *
     * If `states` is provided, will set the state tensors of the RNN to its
     * value.
     *
     * @param states Optional externally-provided initial states.
     * @param training Whether this call is done during training. For stateful
     *   RNNs, this affects whether the old states are kept or discarded. In
     *   particular, if `training` is `true`, the old states will be kept so
     *   that subsequent backpropgataion through time (BPTT) may work properly.
     *   Else, the old states will be discarded.
     */
    resetStates(states, training = false) {
        tidy(() => {
            if (!this.stateful) {
                throw new AttributeError('Cannot call resetStates() on an RNN Layer that is not stateful.');
            }
            const batchSize = this.inputSpec[0].shape[0];
            if (batchSize == null) {
                throw new ValueError('If an RNN is stateful, it needs to know its batch size. Specify ' +
                    'the batch size of your input tensors: \n' +
                    '- If using a Sequential model, specify the batch size by ' +
                    'passing a `batchInputShape` option to your first layer.\n' +
                    '- If using the functional API, specify the batch size by ' +
                    'passing a `batchShape` option to your Input layer.');
            }
            // Initialize state if null.
            if (this.states_ == null) {
                if (Array.isArray(this.cell.stateSize)) {
                    this.states_ =
                        this.cell.stateSize.map(dim => tfc.zeros([batchSize, dim]));
                }
                else {
                    this.states_ = [tfc.zeros([batchSize, this.cell.stateSize])];
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
                    this.states_ =
                        this.cell.stateSize.map(dim => tfc.zeros([batchSize, dim]));
                }
                else {
                    this.states_[0] = tfc.zeros([batchSize, this.cell.stateSize]);
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
                if (training === true) {
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
                    const dim = Array.isArray(this.cell.stateSize) ?
                        this.cell.stateSize[index] :
                        this.cell.stateSize;
                    const expectedShape = [batchSize, dim];
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
    apply(inputs, kwargs) {
        // TODO(cais): Figure out whether initialState is in kwargs or inputs.
        let initialState = kwargs == null ? null : kwargs['initialState'];
        let constants = kwargs == null ? null : kwargs['constants'];
        if (kwargs == null) {
            kwargs = {};
        }
        const standardized = standardizeArgs(inputs, initialState, constants, this.numConstants);
        inputs = standardized.inputs;
        initialState = standardized.initialState;
        constants = standardized.constants;
        // If any of `initial_state` or `constants` are specified and are
        // `tf.SymbolicTensor`s, then add them to the inputs and temporarily modify
        // the input_spec to include them.
        let additionalInputs = [];
        let additionalSpecs = [];
        if (initialState != null) {
            kwargs['initialState'] = initialState;
            additionalInputs = additionalInputs.concat(initialState);
            this.stateSpec = [];
            for (const state of initialState) {
                this.stateSpec.push(new InputSpec({ shape: state.shape }));
            }
            // TODO(cais): Use the following instead.
            // this.stateSpec = initialState.map(state => new InputSpec({shape:
            // state.shape}));
            additionalSpecs = additionalSpecs.concat(this.stateSpec);
        }
        if (constants != null) {
            kwargs['constants'] = constants;
            additionalInputs = additionalInputs.concat(constants);
            // TODO(cais): Add this.constantsSpec.
            this.numConstants = constants.length;
        }
        const isTensor = additionalInputs[0] instanceof SymbolicTensor;
        if (isTensor) {
            // Compute full input spec, including state and constants.
            const fullInput = [inputs].concat(additionalInputs);
            const fullInputSpec = this.inputSpec.concat(additionalSpecs);
            // Perform the call with temporarily replaced inputSpec.
            const originalInputSpec = this.inputSpec;
            this.inputSpec = fullInputSpec;
            const output = super.apply(fullInput, kwargs);
            this.inputSpec = originalInputSpec;
            return output;
        }
        else {
            return super.apply(inputs, kwargs);
        }
    }
    // tslint:disable-next-line:no-any
    call(inputs, kwargs) {
        // Input shape: `[samples, time (padded with zeros), input_dim]`.
        // Note that the .build() method of subclasses **must** define
        // this.inputSpec and this.stateSpec owith complete input shapes.
        return tidy(() => {
            const mask = kwargs == null ? null : kwargs['mask'];
            const training = kwargs == null ? null : kwargs['training'];
            let initialState = kwargs == null ? null : kwargs['initialState'];
            inputs = getExactlyOneTensor(inputs);
            if (initialState == null) {
                if (this.stateful) {
                    initialState = this.states_;
                }
                else {
                    initialState = this.getInitialState(inputs);
                }
            }
            const numStates = Array.isArray(this.cell.stateSize) ? this.cell.stateSize.length : 1;
            if (initialState.length !== numStates) {
                throw new ValueError(`RNN Layer has ${numStates} state(s) but was passed ` +
                    `${initialState.length} initial state(s).`);
            }
            if (this.unroll) {
                console.warn('Ignoring unroll = true for RNN layer, due to imperative backend.');
            }
            const cellCallKwargs = { training };
            // TODO(cais): Add support for constants.
            const step = (inputs, states) => {
                // `inputs` and `states` are concatenated to form a single `Array` of
                // `tf.Tensor`s as the input to `cell.call()`.
                const outputs = this.cell.call([inputs].concat(states), cellCallKwargs);
                // Marshall the return value into output and new states.
                return [outputs[0], outputs.slice(1)];
            };
            // TODO(cais): Add support for constants.
            const rnnOutputs = rnn(step, inputs, initialState, this.goBackwards, mask, null, this.unroll, this.returnSequences);
            const lastOutput = rnnOutputs[0];
            const outputs = rnnOutputs[1];
            const states = rnnOutputs[2];
            if (this.stateful) {
                this.resetStates(states, training);
            }
            const output = this.returnSequences ? outputs : lastOutput;
            // TODO(cais): Porperty set learning phase flag.
            if (this.returnState) {
                return [output].concat(states);
            }
            else {
                return output;
            }
        });
    }
    getInitialState(inputs) {
        return tidy(() => {
            // Build an all-zero tensor of shape [samples, outputDim].
            // [Samples, timeSteps, inputDim].
            let initialState = tfc.zeros(inputs.shape);
            // [Samples].
            initialState = tfc.sum(initialState, [1, 2]);
            initialState = K.expandDims(initialState); // [Samples, 1].
            if (Array.isArray(this.cell.stateSize)) {
                return this.cell.stateSize.map(dim => dim > 1 ? K.tile(initialState, [1, dim]) : initialState);
            }
            else {
                return this.cell.stateSize > 1 ?
                    [K.tile(initialState, [1, this.cell.stateSize])] :
                    [initialState];
            }
        });
    }
    get trainableWeights() {
        if (!this.trainable) {
            return [];
        }
        // Porting Note: In TypeScript, `this` is always an instance of `Layer`.
        return this.cell.trainableWeights;
    }
    get nonTrainableWeights() {
        // Porting Note: In TypeScript, `this` is always an instance of `Layer`.
        if (!this.trainable) {
            return this.cell.weights;
        }
        return this.cell.nonTrainableWeights;
    }
    setFastWeightInitDuringBuild(value) {
        super.setFastWeightInitDuringBuild(value);
        if (this.cell != null) {
            this.cell.setFastWeightInitDuringBuild(value);
        }
    }
    getConfig() {
        const baseConfig = super.getConfig();
        const config = {
            returnSequences: this.returnSequences,
            returnState: this.returnState,
            goBackwards: this.goBackwards,
            stateful: this.stateful,
            unroll: this.unroll,
        };
        if (this.numConstants != null) {
            config['numConstants'] = this.numConstants;
        }
        const cellConfig = this.cell.getConfig();
        if (this.getClassName() === RNN.className) {
            config['cell'] = {
                'className': this.cell.getClassName(),
                'config': cellConfig,
            };
        }
        // this order is necessary, to prevent cell name from replacing layer name
        return Object.assign({}, cellConfig, baseConfig, config);
    }
    /** @nocollapse */
    static fromConfig(cls, config, customObjects = {}) {
        const cellConfig = config['cell'];
        const cell = deserialize(cellConfig, customObjects);
        return new cls(Object.assign(config, { cell }));
    }
}
/** @nocollapse */
RNN.className = 'RNN';
serialization.registerClass(RNN);
// Porting Note: This is a common parent class for RNN cells. There is no
// equivalent of this in PyKeras. Having a common parent class forgoes the
//  need for `has_attr(cell, ...)` checks or its TypeScript equivalent.
/**
 * An RNNCell layer.
 *
 * @doc {heading: 'Layers', subheading: 'Classes'}
 */
export class RNNCell extends Layer {
}
export class SimpleRNNCell extends RNNCell {
    constructor(args) {
        super(args);
        this.DEFAULT_ACTIVATION = 'tanh';
        this.DEFAULT_KERNEL_INITIALIZER = 'glorotNormal';
        this.DEFAULT_RECURRENT_INITIALIZER = 'orthogonal';
        this.DEFAULT_BIAS_INITIALIZER = 'zeros';
        this.units = args.units;
        assertPositiveInteger(this.units, `units`);
        this.activation = getActivation(args.activation == null ? this.DEFAULT_ACTIVATION : args.activation);
        this.useBias = args.useBias == null ? true : args.useBias;
        this.kernelInitializer = getInitializer(args.kernelInitializer || this.DEFAULT_KERNEL_INITIALIZER);
        this.recurrentInitializer = getInitializer(args.recurrentInitializer || this.DEFAULT_RECURRENT_INITIALIZER);
        this.biasInitializer =
            getInitializer(args.biasInitializer || this.DEFAULT_BIAS_INITIALIZER);
        this.kernelRegularizer = getRegularizer(args.kernelRegularizer);
        this.recurrentRegularizer = getRegularizer(args.recurrentRegularizer);
        this.biasRegularizer = getRegularizer(args.biasRegularizer);
        this.kernelConstraint = getConstraint(args.kernelConstraint);
        this.recurrentConstraint = getConstraint(args.recurrentConstraint);
        this.biasConstraint = getConstraint(args.biasConstraint);
        this.dropout = math_utils.min([1, math_utils.max([0, args.dropout == null ? 0 : args.dropout])]);
        this.recurrentDropout = math_utils.min([
            1,
            math_utils.max([0, args.recurrentDropout == null ? 0 : args.recurrentDropout])
        ]);
        this.stateSize = this.units;
        this.dropoutMask = null;
        this.recurrentDropoutMask = null;
    }
    build(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        // TODO(cais): Use regularizer.
        this.kernel = this.addWeight('kernel', [inputShape[inputShape.length - 1], this.units], null, this.kernelInitializer, this.kernelRegularizer, true, this.kernelConstraint);
        this.recurrentKernel = this.addWeight('recurrent_kernel', [this.units, this.units], null, this.recurrentInitializer, this.recurrentRegularizer, true, this.recurrentConstraint);
        if (this.useBias) {
            this.bias = this.addWeight('bias', [this.units], null, this.biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        else {
            this.bias = null;
        }
        this.built = true;
    }
    // Porting Note: PyKeras' equivalent of this method takes two tensor inputs:
    //   `inputs` and `states`. Here, the two tensors are combined into an
    //   `Tensor[]` Array as the first input argument.
    //   Similarly, PyKeras' equivalent of this method returns two values:
    //    `output` and `[output]`. Here the two are combined into one length-2
    //    `Tensor[]`, consisting of `output` repeated.
    call(inputs, kwargs) {
        return tidy(() => {
            inputs = inputs;
            if (inputs.length !== 2) {
                throw new ValueError(`SimpleRNNCell expects 2 input Tensors, got ${inputs.length}.`);
            }
            let prevOutput = inputs[1];
            inputs = inputs[0];
            const training = kwargs['training'] == null ? false : kwargs['training'];
            if (0 < this.dropout && this.dropout < 1 && this.dropoutMask == null) {
                this.dropoutMask = generateDropoutMask({
                    ones: () => tfc.onesLike(inputs),
                    rate: this.dropout,
                    training
                });
            }
            if (0 < this.recurrentDropout && this.recurrentDropout < 1 &&
                this.recurrentDropoutMask == null) {
                this.recurrentDropoutMask = generateDropoutMask({
                    ones: () => tfc.onesLike(prevOutput),
                    rate: this.recurrentDropout,
                    training
                });
            }
            let h;
            const dpMask = this.dropoutMask;
            const recDpMask = this.recurrentDropoutMask;
            if (dpMask != null) {
                h = K.dot(tfc.mul(inputs, dpMask), this.kernel.read());
            }
            else {
                h = K.dot(inputs, this.kernel.read());
            }
            if (this.bias != null) {
                h = K.biasAdd(h, this.bias.read());
            }
            if (recDpMask != null) {
                prevOutput = tfc.mul(prevOutput, recDpMask);
            }
            let output = tfc.add(h, K.dot(prevOutput, this.recurrentKernel.read()));
            if (this.activation != null) {
                output = this.activation.apply(output);
            }
            // TODO(cais): Properly set learning phase on output tensor?
            return [output, output];
        });
    }
    getConfig() {
        const baseConfig = super.getConfig();
        const config = {
            units: this.units,
            activation: serializeActivation(this.activation),
            useBias: this.useBias,
            kernelInitializer: serializeInitializer(this.kernelInitializer),
            recurrentInitializer: serializeInitializer(this.recurrentInitializer),
            biasInitializer: serializeInitializer(this.biasInitializer),
            kernelRegularizer: serializeRegularizer(this.kernelRegularizer),
            recurrentRegularizer: serializeRegularizer(this.recurrentRegularizer),
            biasRegularizer: serializeRegularizer(this.biasRegularizer),
            activityRegularizer: serializeRegularizer(this.activityRegularizer),
            kernelConstraint: serializeConstraint(this.kernelConstraint),
            recurrentConstraint: serializeConstraint(this.recurrentConstraint),
            biasConstraint: serializeConstraint(this.biasConstraint),
            dropout: this.dropout,
            recurrentDropout: this.recurrentDropout,
        };
        return Object.assign({}, baseConfig, config);
    }
}
/** @nocollapse */
SimpleRNNCell.className = 'SimpleRNNCell';
serialization.registerClass(SimpleRNNCell);
export class SimpleRNN extends RNN {
    constructor(args) {
        args.cell = new SimpleRNNCell(args);
        super(args);
        // TODO(cais): Add activityRegularizer.
    }
    call(inputs, kwargs) {
        return tidy(() => {
            if (this.cell.dropoutMask != null) {
                tfc.dispose(this.cell.dropoutMask);
                this.cell.dropoutMask = null;
            }
            if (this.cell.recurrentDropoutMask != null) {
                tfc.dispose(this.cell.recurrentDropoutMask);
                this.cell.recurrentDropoutMask = null;
            }
            const mask = kwargs == null ? null : kwargs['mask'];
            const training = kwargs == null ? null : kwargs['training'];
            const initialState = kwargs == null ? null : kwargs['initialState'];
            return super.call(inputs, { mask, training, initialState });
        });
    }
    /** @nocollapse */
    static fromConfig(cls, config) {
        return new cls(config);
    }
}
/** @nocollapse */
SimpleRNN.className = 'SimpleRNN';
serialization.registerClass(SimpleRNN);
export class GRUCell extends RNNCell {
    constructor(args) {
        super(args);
        this.DEFAULT_ACTIVATION = 'tanh';
        this.DEFAULT_RECURRENT_ACTIVATION = 'hardSigmoid';
        this.DEFAULT_KERNEL_INITIALIZER = 'glorotNormal';
        this.DEFAULT_RECURRENT_INITIALIZER = 'orthogonal';
        this.DEFAULT_BIAS_INITIALIZER = 'zeros';
        if (args.resetAfter) {
            throw new ValueError(`GRUCell does not support reset_after parameter set to true.`);
        }
        this.units = args.units;
        assertPositiveInteger(this.units, 'units');
        this.activation = getActivation(args.activation === undefined ? this.DEFAULT_ACTIVATION :
            args.activation);
        this.recurrentActivation = getActivation(args.recurrentActivation === undefined ?
            this.DEFAULT_RECURRENT_ACTIVATION :
            args.recurrentActivation);
        this.useBias = args.useBias == null ? true : args.useBias;
        this.kernelInitializer = getInitializer(args.kernelInitializer || this.DEFAULT_KERNEL_INITIALIZER);
        this.recurrentInitializer = getInitializer(args.recurrentInitializer || this.DEFAULT_RECURRENT_INITIALIZER);
        this.biasInitializer =
            getInitializer(args.biasInitializer || this.DEFAULT_BIAS_INITIALIZER);
        this.kernelRegularizer = getRegularizer(args.kernelRegularizer);
        this.recurrentRegularizer = getRegularizer(args.recurrentRegularizer);
        this.biasRegularizer = getRegularizer(args.biasRegularizer);
        this.kernelConstraint = getConstraint(args.kernelConstraint);
        this.recurrentConstraint = getConstraint(args.recurrentConstraint);
        this.biasConstraint = getConstraint(args.biasConstraint);
        this.dropout = math_utils.min([1, math_utils.max([0, args.dropout == null ? 0 : args.dropout])]);
        this.recurrentDropout = math_utils.min([
            1,
            math_utils.max([0, args.recurrentDropout == null ? 0 : args.recurrentDropout])
        ]);
        this.implementation = args.implementation;
        this.stateSize = this.units;
        this.dropoutMask = null;
        this.recurrentDropoutMask = null;
    }
    build(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        const inputDim = inputShape[inputShape.length - 1];
        this.kernel = this.addWeight('kernel', [inputDim, this.units * 3], null, this.kernelInitializer, this.kernelRegularizer, true, this.kernelConstraint);
        this.recurrentKernel = this.addWeight('recurrent_kernel', [this.units, this.units * 3], null, this.recurrentInitializer, this.recurrentRegularizer, true, this.recurrentConstraint);
        if (this.useBias) {
            this.bias = this.addWeight('bias', [this.units * 3], null, this.biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        else {
            this.bias = null;
        }
        // Porting Notes: Unlike the PyKeras implementation, we perform slicing
        //   of the weights and bias in the call() method, at execution time.
        this.built = true;
    }
    call(inputs, kwargs) {
        return tidy(() => {
            inputs = inputs;
            if (inputs.length !== 2) {
                throw new ValueError(`GRUCell expects 2 input Tensors (inputs, h, c), got ` +
                    `${inputs.length}.`);
            }
            const training = kwargs['training'] == null ? false : kwargs['training'];
            let hTMinus1 = inputs[1]; // Previous memory state.
            inputs = inputs[0];
            // Note: For superior performance, TensorFlow.js always uses
            // implementation 2, regardless of the actual value of
            // config.implementation.
            if (0 < this.dropout && this.dropout < 1 && this.dropoutMask == null) {
                this.dropoutMask = generateDropoutMask({
                    ones: () => tfc.onesLike(inputs),
                    rate: this.dropout,
                    training,
                    count: 3
                });
            }
            if (0 < this.recurrentDropout && this.recurrentDropout < 1 &&
                this.recurrentDropoutMask == null) {
                this.recurrentDropoutMask = generateDropoutMask({
                    ones: () => tfc.onesLike(hTMinus1),
                    rate: this.recurrentDropout,
                    training,
                    count: 3
                });
            }
            const dpMask = this.dropoutMask;
            const recDpMask = this.recurrentDropoutMask;
            let z;
            let r;
            let hh;
            if (0 < this.dropout && this.dropout < 1) {
                inputs = tfc.mul(inputs, dpMask[0]);
            }
            let matrixX = K.dot(inputs, this.kernel.read());
            if (this.useBias) {
                matrixX = K.biasAdd(matrixX, this.bias.read());
            }
            if (0 < this.recurrentDropout && this.recurrentDropout < 1) {
                hTMinus1 = tfc.mul(hTMinus1, recDpMask[0]);
            }
            const recurrentKernelValue = this.recurrentKernel.read();
            const [rk1, rk2] = tfc.split(recurrentKernelValue, [2 * this.units, this.units], recurrentKernelValue.rank - 1);
            const matrixInner = K.dot(hTMinus1, rk1);
            const [xZ, xR, xH] = tfc.split(matrixX, 3, matrixX.rank - 1);
            const [recurrentZ, recurrentR] = tfc.split(matrixInner, 2, matrixInner.rank - 1);
            z = this.recurrentActivation.apply(tfc.add(xZ, recurrentZ));
            r = this.recurrentActivation.apply(tfc.add(xR, recurrentR));
            const recurrentH = K.dot(tfc.mul(r, hTMinus1), rk2);
            hh = this.activation.apply(tfc.add(xH, recurrentH));
            const h = tfc.add(tfc.mul(z, hTMinus1), tfc.mul(tfc.add(1, tfc.neg(z)), hh));
            // TODO(cais): Add use_learning_phase flag properly.
            return [h, h];
        });
    }
    getConfig() {
        const baseConfig = super.getConfig();
        const config = {
            units: this.units,
            activation: serializeActivation(this.activation),
            recurrentActivation: serializeActivation(this.recurrentActivation),
            useBias: this.useBias,
            kernelInitializer: serializeInitializer(this.kernelInitializer),
            recurrentInitializer: serializeInitializer(this.recurrentInitializer),
            biasInitializer: serializeInitializer(this.biasInitializer),
            kernelRegularizer: serializeRegularizer(this.kernelRegularizer),
            recurrentRegularizer: serializeRegularizer(this.recurrentRegularizer),
            biasRegularizer: serializeRegularizer(this.biasRegularizer),
            activityRegularizer: serializeRegularizer(this.activityRegularizer),
            kernelConstraint: serializeConstraint(this.kernelConstraint),
            recurrentConstraint: serializeConstraint(this.recurrentConstraint),
            biasConstraint: serializeConstraint(this.biasConstraint),
            dropout: this.dropout,
            recurrentDropout: this.recurrentDropout,
            implementation: this.implementation,
            resetAfter: false
        };
        return Object.assign({}, baseConfig, config);
    }
}
/** @nocollapse */
GRUCell.className = 'GRUCell';
serialization.registerClass(GRUCell);
export class GRU extends RNN {
    constructor(args) {
        if (args.implementation === 0) {
            console.warn('`implementation=0` has been deprecated, and now defaults to ' +
                '`implementation=1`. Please update your layer call.');
        }
        args.cell = new GRUCell(args);
        super(args);
        // TODO(cais): Add activityRegularizer.
    }
    call(inputs, kwargs) {
        return tidy(() => {
            if (this.cell.dropoutMask != null) {
                tfc.dispose(this.cell.dropoutMask);
                this.cell.dropoutMask = null;
            }
            if (this.cell.recurrentDropoutMask != null) {
                tfc.dispose(this.cell.recurrentDropoutMask);
                this.cell.recurrentDropoutMask = null;
            }
            const mask = kwargs == null ? null : kwargs['mask'];
            const training = kwargs == null ? null : kwargs['training'];
            const initialState = kwargs == null ? null : kwargs['initialState'];
            return super.call(inputs, { mask, training, initialState });
        });
    }
    /** @nocollapse */
    static fromConfig(cls, config) {
        if (config['implmentation'] === 0) {
            config['implementation'] = 1;
        }
        return new cls(config);
    }
}
/** @nocollapse */
GRU.className = 'GRU';
serialization.registerClass(GRU);
export class LSTMCell extends RNNCell {
    constructor(args) {
        super(args);
        this.DEFAULT_ACTIVATION = 'tanh';
        this.DEFAULT_RECURRENT_ACTIVATION = 'hardSigmoid';
        this.DEFAULT_KERNEL_INITIALIZER = 'glorotNormal';
        this.DEFAULT_RECURRENT_INITIALIZER = 'orthogonal';
        this.DEFAULT_BIAS_INITIALIZER = 'zeros';
        this.units = args.units;
        assertPositiveInteger(this.units, 'units');
        this.activation = getActivation(args.activation === undefined ? this.DEFAULT_ACTIVATION :
            args.activation);
        this.recurrentActivation = getActivation(args.recurrentActivation === undefined ?
            this.DEFAULT_RECURRENT_ACTIVATION :
            args.recurrentActivation);
        this.useBias = args.useBias == null ? true : args.useBias;
        this.kernelInitializer = getInitializer(args.kernelInitializer || this.DEFAULT_KERNEL_INITIALIZER);
        this.recurrentInitializer = getInitializer(args.recurrentInitializer || this.DEFAULT_RECURRENT_INITIALIZER);
        this.biasInitializer =
            getInitializer(args.biasInitializer || this.DEFAULT_BIAS_INITIALIZER);
        this.unitForgetBias = args.unitForgetBias;
        this.kernelRegularizer = getRegularizer(args.kernelRegularizer);
        this.recurrentRegularizer = getRegularizer(args.recurrentRegularizer);
        this.biasRegularizer = getRegularizer(args.biasRegularizer);
        this.kernelConstraint = getConstraint(args.kernelConstraint);
        this.recurrentConstraint = getConstraint(args.recurrentConstraint);
        this.biasConstraint = getConstraint(args.biasConstraint);
        this.dropout = math_utils.min([1, math_utils.max([0, args.dropout == null ? 0 : args.dropout])]);
        this.recurrentDropout = math_utils.min([
            1,
            math_utils.max([0, args.recurrentDropout == null ? 0 : args.recurrentDropout])
        ]);
        this.implementation = args.implementation;
        this.stateSize = [this.units, this.units];
        this.dropoutMask = null;
        this.recurrentDropoutMask = null;
    }
    build(inputShape) {
        var _a;
        inputShape = getExactlyOneShape(inputShape);
        const inputDim = inputShape[inputShape.length - 1];
        this.kernel = this.addWeight('kernel', [inputDim, this.units * 4], null, this.kernelInitializer, this.kernelRegularizer, true, this.kernelConstraint);
        this.recurrentKernel = this.addWeight('recurrent_kernel', [this.units, this.units * 4], null, this.recurrentInitializer, this.recurrentRegularizer, true, this.recurrentConstraint);
        let biasInitializer;
        if (this.useBias) {
            if (this.unitForgetBias) {
                const capturedBiasInit = this.biasInitializer;
                const capturedUnits = this.units;
                biasInitializer = new (_a = class CustomInit extends Initializer {
                        apply(shape, dtype) {
                            // TODO(cais): More informative variable names?
                            const bI = capturedBiasInit.apply([capturedUnits]);
                            const bF = (new Ones()).apply([capturedUnits]);
                            const bCAndH = capturedBiasInit.apply([capturedUnits * 2]);
                            return K.concatAlongFirstAxis(K.concatAlongFirstAxis(bI, bF), bCAndH);
                        }
                    },
                    /** @nocollapse */
                    _a.className = 'CustomInit',
                    _a)();
            }
            else {
                biasInitializer = this.biasInitializer;
            }
            this.bias = this.addWeight('bias', [this.units * 4], null, biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        else {
            this.bias = null;
        }
        // Porting Notes: Unlike the PyKeras implementation, we perform slicing
        //   of the weights and bias in the call() method, at execution time.
        this.built = true;
    }
    call(inputs, kwargs) {
        return tidy(() => {
            const training = kwargs['training'] == null ? false : kwargs['training'];
            inputs = inputs;
            if (inputs.length !== 3) {
                throw new ValueError(`LSTMCell expects 3 input Tensors (inputs, h, c), got ` +
                    `${inputs.length}.`);
            }
            let hTMinus1 = inputs[1]; // Previous memory state.
            const cTMinus1 = inputs[2]; // Previous carry state.
            inputs = inputs[0];
            if (0 < this.dropout && this.dropout < 1 && this.dropoutMask == null) {
                this.dropoutMask = generateDropoutMask({
                    ones: () => tfc.onesLike(inputs),
                    rate: this.dropout,
                    training,
                    count: 4
                });
            }
            if (0 < this.recurrentDropout && this.recurrentDropout < 1 &&
                this.recurrentDropoutMask == null) {
                this.recurrentDropoutMask = generateDropoutMask({
                    ones: () => tfc.onesLike(hTMinus1),
                    rate: this.recurrentDropout,
                    training,
                    count: 4
                });
            }
            const dpMask = this.dropoutMask;
            const recDpMask = this.recurrentDropoutMask;
            // Note: For superior performance, TensorFlow.js always uses
            // implementation 2 regardless of the actual value of
            // config.implementation.
            let i;
            let f;
            let c;
            let o;
            if (0 < this.dropout && this.dropout < 1) {
                inputs = tfc.mul(inputs, dpMask[0]);
            }
            let z = K.dot(inputs, this.kernel.read());
            if (0 < this.recurrentDropout && this.recurrentDropout < 1) {
                hTMinus1 = tfc.mul(hTMinus1, recDpMask[0]);
            }
            z = tfc.add(z, K.dot(hTMinus1, this.recurrentKernel.read()));
            if (this.useBias) {
                z = K.biasAdd(z, this.bias.read());
            }
            const [z0, z1, z2, z3] = tfc.split(z, 4, z.rank - 1);
            i = this.recurrentActivation.apply(z0);
            f = this.recurrentActivation.apply(z1);
            c = tfc.add(tfc.mul(f, cTMinus1), tfc.mul(i, this.activation.apply(z2)));
            o = this.recurrentActivation.apply(z3);
            const h = tfc.mul(o, this.activation.apply(c));
            // TODO(cais): Add use_learning_phase flag properly.
            return [h, h, c];
        });
    }
    getConfig() {
        const baseConfig = super.getConfig();
        const config = {
            units: this.units,
            activation: serializeActivation(this.activation),
            recurrentActivation: serializeActivation(this.recurrentActivation),
            useBias: this.useBias,
            kernelInitializer: serializeInitializer(this.kernelInitializer),
            recurrentInitializer: serializeInitializer(this.recurrentInitializer),
            biasInitializer: serializeInitializer(this.biasInitializer),
            unitForgetBias: this.unitForgetBias,
            kernelRegularizer: serializeRegularizer(this.kernelRegularizer),
            recurrentRegularizer: serializeRegularizer(this.recurrentRegularizer),
            biasRegularizer: serializeRegularizer(this.biasRegularizer),
            activityRegularizer: serializeRegularizer(this.activityRegularizer),
            kernelConstraint: serializeConstraint(this.kernelConstraint),
            recurrentConstraint: serializeConstraint(this.recurrentConstraint),
            biasConstraint: serializeConstraint(this.biasConstraint),
            dropout: this.dropout,
            recurrentDropout: this.recurrentDropout,
            implementation: this.implementation,
        };
        return Object.assign({}, baseConfig, config);
    }
}
/** @nocollapse */
LSTMCell.className = 'LSTMCell';
serialization.registerClass(LSTMCell);
export class LSTM extends RNN {
    constructor(args) {
        if (args.implementation === 0) {
            console.warn('`implementation=0` has been deprecated, and now defaults to ' +
                '`implementation=1`. Please update your layer call.');
        }
        args.cell = new LSTMCell(args);
        super(args);
        // TODO(cais): Add activityRegularizer.
    }
    call(inputs, kwargs) {
        return tidy(() => {
            if (this.cell.dropoutMask != null) {
                tfc.dispose(this.cell.dropoutMask);
                this.cell.dropoutMask = null;
            }
            if (this.cell.recurrentDropoutMask != null) {
                tfc.dispose(this.cell.recurrentDropoutMask);
                this.cell.recurrentDropoutMask = null;
            }
            const mask = kwargs == null ? null : kwargs['mask'];
            const training = kwargs == null ? null : kwargs['training'];
            const initialState = kwargs == null ? null : kwargs['initialState'];
            return super.call(inputs, { mask, training, initialState });
        });
    }
    /** @nocollapse */
    static fromConfig(cls, config) {
        if (config['implmentation'] === 0) {
            config['implementation'] = 1;
        }
        return new cls(config);
    }
}
/** @nocollapse */
LSTM.className = 'LSTM';
serialization.registerClass(LSTM);
export class StackedRNNCells extends RNNCell {
    constructor(args) {
        super(args);
        this.cells = args.cells;
    }
    get stateSize() {
        // States are a flat list in reverse order of the cell stack.
        // This allows perserving the requirement `stack.statesize[0] ===
        // outputDim`. E.g., states of a 2-layer LSTM would be `[h2, c2, h1, c1]`,
        // assuming one LSTM has states `[h, c]`.
        const stateSize = [];
        for (const cell of this.cells.slice().reverse()) {
            if (Array.isArray(cell.stateSize)) {
                stateSize.push(...cell.stateSize);
            }
            else {
                stateSize.push(cell.stateSize);
            }
        }
        return stateSize;
    }
    call(inputs, kwargs) {
        return tidy(() => {
            inputs = inputs;
            let states = inputs.slice(1);
            // Recover per-cell states.
            const nestedStates = [];
            for (const cell of this.cells.slice().reverse()) {
                if (Array.isArray(cell.stateSize)) {
                    nestedStates.push(states.splice(0, cell.stateSize.length));
                }
                else {
                    nestedStates.push(states.splice(0, 1));
                }
            }
            nestedStates.reverse();
            // Call the cells in order and store the returned states.
            const newNestedStates = [];
            let callInputs;
            for (let i = 0; i < this.cells.length; ++i) {
                const cell = this.cells[i];
                states = nestedStates[i];
                // TODO(cais): Take care of constants.
                if (i === 0) {
                    callInputs = [inputs[0]].concat(states);
                }
                else {
                    callInputs = [callInputs[0]].concat(states);
                }
                callInputs = cell.call(callInputs, kwargs);
                newNestedStates.push(callInputs.slice(1));
            }
            // Format the new states as a flat list in reverse cell order.
            states = [];
            for (const cellStates of newNestedStates.slice().reverse()) {
                states.push(...cellStates);
            }
            return [callInputs[0]].concat(states);
        });
    }
    build(inputShape) {
        if (isArrayOfShapes(inputShape)) {
            // TODO(cais): Take care of input constants.
            // const constantShape = inputShape.slice(1);
            inputShape = inputShape[0];
        }
        inputShape = inputShape;
        let outputDim;
        this.cells.forEach((cell, i) => {
            nameScope(`RNNCell_${i}`, () => {
                // TODO(cais): Take care of input constants.
                cell.build(inputShape);
                if (Array.isArray(cell.stateSize)) {
                    outputDim = cell.stateSize[0];
                }
                else {
                    outputDim = cell.stateSize;
                }
                inputShape = [inputShape[0], outputDim];
            });
        });
        this.built = true;
    }
    getConfig() {
        const baseConfig = super.getConfig();
        const getCellConfig = (cell) => {
            return {
                'className': cell.getClassName(),
                'config': cell.getConfig(),
            };
        };
        const cellConfigs = this.cells.map(getCellConfig);
        const config = { 'cells': cellConfigs };
        return Object.assign({}, baseConfig, config);
    }
    /** @nocollapse */
    static fromConfig(cls, config, customObjects = {}) {
        const cells = [];
        for (const cellConfig of config['cells']) {
            cells.push(deserialize(cellConfig, customObjects));
        }
        return new cls({ cells });
    }
    get trainableWeights() {
        if (!this.trainable) {
            return [];
        }
        const weights = [];
        for (const cell of this.cells) {
            weights.push(...cell.trainableWeights);
        }
        return weights;
    }
    get nonTrainableWeights() {
        const weights = [];
        for (const cell of this.cells) {
            weights.push(...cell.nonTrainableWeights);
        }
        if (!this.trainable) {
            const trainableWeights = [];
            for (const cell of this.cells) {
                trainableWeights.push(...cell.trainableWeights);
            }
            return trainableWeights.concat(weights);
        }
        return weights;
    }
    /**
     * Retrieve the weights of a the model.
     *
     * @returns A flat `Array` of `tf.Tensor`s.
     */
    getWeights() {
        const weights = [];
        for (const cell of this.cells) {
            weights.push(...cell.weights);
        }
        return batchGetValue(weights);
    }
    /**
     * Set the weights of the model.
     *
     * @param weights An `Array` of `tf.Tensor`s with shapes and types matching
     *     the output of `getWeights()`.
     */
    setWeights(weights) {
        const tuples = [];
        for (const cell of this.cells) {
            const numParams = cell.weights.length;
            const inputWeights = weights.splice(numParams);
            for (let i = 0; i < cell.weights.length; ++i) {
                tuples.push([cell.weights[i], inputWeights[i]]);
            }
        }
        batchSetValue(tuples);
    }
}
/** @nocollapse */
StackedRNNCells.className = 'StackedRNNCells';
serialization.registerClass(StackedRNNCells);
export function generateDropoutMask(args) {
    const { ones, rate, training = false, count = 1 } = args;
    const droppedInputs = () => K.dropout(ones(), rate);
    const createMask = () => K.inTrainPhase(droppedInputs, ones, training);
    // just in case count is provided with null or undefined
    if (!count || count <= 1) {
        return tfc.keep(createMask().clone());
    }
    const masks = Array(count).fill(undefined).map(createMask);
    return masks.map(m => tfc.keep(m.clone()));
}
//# sourceMappingURL=recurrent.js.map