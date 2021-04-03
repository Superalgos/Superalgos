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
import { serialization, Tensor } from '@tensorflow/tfjs-core';
import { Activation } from '../activations';
import { Constraint, ConstraintIdentifier } from '../constraints';
import { InputSpec, SymbolicTensor } from '../engine/topology';
import { Layer, LayerArgs } from '../engine/topology';
import { Initializer, InitializerIdentifier } from '../initializers';
import { ActivationIdentifier } from '../keras_format/activation_config';
import { Shape } from '../keras_format/common';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Kwargs, RnnStepFunction } from '../types';
import { LayerVariable } from '../variables';
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
export declare function standardizeArgs(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], initialState: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], constants: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], numConstants?: number): {
    inputs: Tensor | SymbolicTensor;
    initialState: Tensor[] | SymbolicTensor[];
    constants: Tensor[] | SymbolicTensor[];
};
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
export declare function rnn(stepFunction: RnnStepFunction, inputs: Tensor, initialStates: Tensor[], goBackwards?: boolean, mask?: Tensor, constants?: Tensor[], unroll?: boolean, needPerStepOutputs?: boolean): [Tensor, Tensor, Tensor[]];
export declare interface BaseRNNLayerArgs extends LayerArgs {
    /**
     * A RNN cell instance. A RNN cell is a class that has:
     *   - a `call()` method, which takes `[Tensor, Tensor]` as the
     *     first input argument. The first item is the input at time t, and
     *     second item is the cell state at time t.
     *     The `call()` method returns `[outputAtT, statesAtTPlus1]`.
     *     The `call()` method of the cell can also take the argument `constants`,
     *     see section "Note on passing external constants" below.
     *     Porting Node: PyKeras overrides the `call()` signature of RNN cells,
     *       which are Layer subtypes, to accept two arguments. tfjs-layers does
     *       not do such overriding. Instead we preseve the `call()` signature,
     *       which due to its `Tensor|Tensor[]` argument and return value, is
     *       flexible enough to handle the inputs and states.
     *   - a `stateSize` attribute. This can be a single integer (single state)
     *     in which case it is the size of the recurrent state (which should be
     *     the same as the size of the cell output). This can also be an Array of
     *     integers (one size per state). In this case, the first entry
     *     (`stateSize[0]`) should be the same as the size of the cell output.
     * It is also possible for `cell` to be a list of RNN cell instances, in which
     * case the cells get stacked on after the other in the RNN, implementing an
     * efficient stacked RNN.
     */
    cell?: RNNCell | RNNCell[];
    /**
     * Whether to return the last output in the output sequence, or the full
     * sequence.
     */
    returnSequences?: boolean;
    /**
     * Whether to return the last state in addition to the output.
     */
    returnState?: boolean;
    /**
     * If `true`, process the input sequence backwards and return the reversed
     * sequence (default: `false`).
     */
    goBackwards?: boolean;
    /**
     * If `true`, the last state for each sample at index i in a batch will be
     * used as initial state of the sample of index i in the following batch
     * (default: `false`).
     *
     * You can set RNN layers to be "stateful", which means that the states
     * computed for the samples in one batch will be reused as initial states
     * for the samples in the next batch. This assumes a one-to-one mapping
     * between samples in different successive batches.
     *
     * To enable "statefulness":
     *   - specify `stateful: true` in the layer constructor.
     *   - specify a fixed batch size for your model, by passing
     *     - if sequential model:
     *       `batchInputShape: [...]` to the first layer in your model.
     *     - else for functional model with 1 or more Input layers:
     *       `batchShape: [...]` to all the first layers in your model.
     *     This is the expected shape of your inputs
     *     *including the batch size*.
     *     It should be a tuple of integers, e.g., `[32, 10, 100]`.
     *   - specify `shuffle: false` when calling `LayersModel.fit()`.
     *
     * To reset the state of your model, call `resetStates()` on either the
     * specific layer or on the entire model.
     */
    stateful?: boolean;
    /**
     * If `true`, the network will be unrolled, else a symbolic loop will be
     * used. Unrolling can speed-up a RNN, although it tends to be more memory-
     * intensive. Unrolling is only suitable for short sequences (default:
     * `false`).
     * Porting Note: tfjs-layers has an imperative backend. RNNs are executed with
     *   normal TypeScript control flow. Hence this property is inapplicable and
     *   ignored in tfjs-layers.
     */
    unroll?: boolean;
    /**
     * Dimensionality of the input (integer).
     *   This option (or alternatively, the option `inputShape`) is required when
     *   this layer is used as the first layer in a model.
     */
    inputDim?: number;
    /**
     * Length of the input sequences, to be specified when it is constant.
     * This argument is required if you are going to connect `Flatten` then
     * `Dense` layers upstream (without it, the shape of the dense outputs cannot
     * be computed). Note that if the recurrent layer is not the first layer in
     * your model, you would need to specify the input length at the level of the
     * first layer (e.g., via the `inputShape` option).
     */
    inputLength?: number;
}
export declare class RNN extends Layer {
    /** @nocollapse */
    static className: string;
    readonly cell: RNNCell;
    readonly returnSequences: boolean;
    readonly returnState: boolean;
    readonly goBackwards: boolean;
    readonly unroll: boolean;
    stateSpec: InputSpec[];
    protected states_: Tensor[];
    protected keptStates: Tensor[][];
    private numConstants;
    constructor(args: RNNLayerArgs);
    getStates(): Tensor[];
    setStates(states: Tensor[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor | Tensor[];
    /**
     * Get the current state tensors of the RNN.
     *
     * If the state hasn't been set, return an array of `null`s of the correct
     * length.
     */
    states: Tensor[];
    build(inputShape: Shape | Shape[]): void;
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
    resetStates(states?: Tensor | Tensor[], training?: boolean): void;
    apply(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], kwargs?: Kwargs): Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getInitialState(inputs: Tensor): Tensor[];
    readonly trainableWeights: LayerVariable[];
    readonly nonTrainableWeights: LayerVariable[];
    setFastWeightInitDuringBuild(value: boolean): void;
    getConfig(): serialization.ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict, customObjects?: serialization.ConfigDict): T;
}
/**
 * An RNNCell layer.
 *
 * @doc {heading: 'Layers', subheading: 'Classes'}
 */
export declare abstract class RNNCell extends Layer {
    /**
     * Size(s) of the states.
     * For RNN cells with only a single state, this is a single integer.
     */
    abstract stateSize: number | number[];
    dropoutMask: Tensor | Tensor[];
    recurrentDropoutMask: Tensor | Tensor[];
}
export declare interface SimpleRNNCellLayerArgs extends LayerArgs {
    /**
     * units: Positive integer, dimensionality of the output space.
     */
    units: number;
    /**
     * Activation function to use.
     * Default: hyperbolic tangent ('tanh').
     * If you pass `null`,  'linear' activation will be applied.
     */
    activation?: ActivationIdentifier;
    /**
     * Whether the layer uses a bias vector.
     */
    useBias?: boolean;
    /**
     * Initializer for the `kernel` weights matrix, used for the linear
     * transformation of the inputs.
     */
    kernelInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the `recurrentKernel` weights matrix, used for
     * linear transformation of the recurrent state.
     */
    recurrentInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the bias vector.
     */
    biasInitializer?: InitializerIdentifier | Initializer;
    /**
     * Regularizer function applied to the `kernel` weights matrix.
     */
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the `recurrent_kernel` weights matrix.
     */
    recurrentRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the bias vector.
     */
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Constraint function applied to the `kernel` weights matrix.
     */
    kernelConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint function applied to the `recurrentKernel` weights matrix.
     */
    recurrentConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraintfunction applied to the bias vector.
     */
    biasConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Float number between 0 and 1. Fraction of the units to drop for the linear
     * transformation of the inputs.
     */
    dropout?: number;
    /**
     * Float number between 0 and 1. Fraction of the units to drop for the linear
     * transformation of the recurrent state.
     */
    recurrentDropout?: number;
}
export declare class SimpleRNNCell extends RNNCell {
    /** @nocollapse */
    static className: string;
    readonly units: number;
    readonly activation: Activation;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly stateSize: number;
    kernel: LayerVariable;
    recurrentKernel: LayerVariable;
    bias: LayerVariable;
    readonly DEFAULT_ACTIVATION = "tanh";
    readonly DEFAULT_KERNEL_INITIALIZER = "glorotNormal";
    readonly DEFAULT_RECURRENT_INITIALIZER = "orthogonal";
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    constructor(args: SimpleRNNCellLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare interface SimpleRNNLayerArgs extends BaseRNNLayerArgs {
    /**
     * Positive integer, dimensionality of the output space.
     */
    units: number;
    /**
     * Activation function to use.
     *
     * Defaults to  hyperbolic tangent (`tanh`)
     *
     * If you pass `null`, no activation will be applied.
     */
    activation?: ActivationIdentifier;
    /**
     * Whether the layer uses a bias vector.
     */
    useBias?: boolean;
    /**
     * Initializer for the `kernel` weights matrix, used for the linear
     * transformation of the inputs.
     */
    kernelInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the `recurrentKernel` weights matrix, used for
     * linear transformation of the recurrent state.
     */
    recurrentInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the bias vector.
     */
    biasInitializer?: InitializerIdentifier | Initializer;
    /**
     * Regularizer function applied to the kernel weights matrix.
     */
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the recurrentKernel weights matrix.
     */
    recurrentRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the bias vector.
     */
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Constraint function applied to the kernel weights matrix.
     */
    kernelConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint function applied to the recurrentKernel weights matrix.
     */
    recurrentConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint function applied to the bias vector.
     */
    biasConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Number between 0 and 1. Fraction of the units to drop for the linear
     * transformation of the inputs.
     */
    dropout?: number;
    /**
     * Number between 0 and 1. Fraction of the units to drop for the linear
     * transformation of the recurrent state.
     */
    recurrentDropout?: number;
}
/**
 * RNNLayerConfig is identical to BaseRNNLayerConfig, except it makes the
 * `cell` property required. This interface is to be used with constructors
 * of concrete RNN layer subtypes.
 */
export declare interface RNNLayerArgs extends BaseRNNLayerArgs {
    cell: RNNCell | RNNCell[];
}
export declare class SimpleRNN extends RNN {
    /** @nocollapse */
    static className: string;
    constructor(args: SimpleRNNLayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict): T;
}
export declare interface GRUCellLayerArgs extends SimpleRNNCellLayerArgs {
    /**
     * Activation function to use for the recurrent step.
     *
     * Defaults to hard sigmoid (`hardSigmoid`).
     *
     * If `null`, no activation is applied.
     */
    recurrentActivation?: ActivationIdentifier;
    /**
     * Implementation mode, either 1 or 2.
     *
     * Mode 1 will structure its operations as a larger number of
     *   smaller dot products and additions.
     *
     * Mode 2 will batch them into fewer, larger operations. These modes will
     * have different performance profiles on different hardware and
     * for different applications.
     *
     * Note: For superior performance, TensorFlow.js always uses implementation
     * 2, regardless of the actual value of this configuration field.
     */
    implementation?: number;
    /**
     * GRU convention (whether to apply reset gate after or before matrix
     * multiplication). false = "before", true = "after" (only false is
     * supported).
     */
    resetAfter?: boolean;
}
export declare class GRUCell extends RNNCell {
    /** @nocollapse */
    static className: string;
    readonly units: number;
    readonly activation: Activation;
    readonly recurrentActivation: Activation;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly stateSize: number;
    readonly implementation: number;
    readonly DEFAULT_ACTIVATION = "tanh";
    readonly DEFAULT_RECURRENT_ACTIVATION: ActivationIdentifier;
    readonly DEFAULT_KERNEL_INITIALIZER = "glorotNormal";
    readonly DEFAULT_RECURRENT_INITIALIZER = "orthogonal";
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    kernel: LayerVariable;
    recurrentKernel: LayerVariable;
    bias: LayerVariable;
    constructor(args: GRUCellLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare interface GRULayerArgs extends SimpleRNNLayerArgs {
    /**
     * Activation function to use for the recurrent step.
     *
     * Defaults to hard sigmoid (`hardSigmoid`).
     *
     * If `null`, no activation is applied.
     */
    recurrentActivation?: ActivationIdentifier;
    /**
     * Implementation mode, either 1 or 2.
     *
     * Mode 1 will structure its operations as a larger number of
     * smaller dot products and additions.
     *
     * Mode 2 will batch them into fewer, larger operations. These modes will
     * have different performance profiles on different hardware and
     * for different applications.
     *
     * Note: For superior performance, TensorFlow.js always uses implementation
     * 2, regardless of the actual value of this configuration field.
     */
    implementation?: number;
}
export declare class GRU extends RNN {
    /** @nocollapse */
    static className: string;
    constructor(args: GRULayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict): T;
}
export declare interface LSTMCellLayerArgs extends SimpleRNNCellLayerArgs {
    /**
     * Activation function to use for the recurrent step.
     *
     * Defaults to hard sigmoid (`hardSigmoid`).
     *
     * If `null`, no activation is applied.
     */
    recurrentActivation?: ActivationIdentifier;
    /**
     * If `true`, add 1 to the bias of the forget gate at initialization.
     * Setting it to `true` will also force `biasInitializer = 'zeros'`.
     * This is recommended in
     * [Jozefowicz et
     * al.](http://www.jmlr.org/proceedings/papers/v37/jozefowicz15.pdf).
     */
    unitForgetBias?: boolean;
    /**
     * Implementation mode, either 1 or 2.
     *
     * Mode 1 will structure its operations as a larger number of
     *   smaller dot products and additions.
     *
     * Mode 2 will batch them into fewer, larger operations. These modes will
     * have different performance profiles on different hardware and
     * for different applications.
     *
     * Note: For superior performance, TensorFlow.js always uses implementation
     * 2, regardless of the actual value of this configuration field.
     */
    implementation?: number;
}
export declare class LSTMCell extends RNNCell {
    /** @nocollapse */
    static className: string;
    readonly units: number;
    readonly activation: Activation;
    readonly recurrentActivation: Activation;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly unitForgetBias: boolean;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly stateSize: number[];
    readonly implementation: number;
    readonly DEFAULT_ACTIVATION = "tanh";
    readonly DEFAULT_RECURRENT_ACTIVATION = "hardSigmoid";
    readonly DEFAULT_KERNEL_INITIALIZER = "glorotNormal";
    readonly DEFAULT_RECURRENT_INITIALIZER = "orthogonal";
    readonly DEFAULT_BIAS_INITIALIZER = "zeros";
    kernel: LayerVariable;
    recurrentKernel: LayerVariable;
    bias: LayerVariable;
    constructor(args: LSTMCellLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare interface LSTMLayerArgs extends SimpleRNNLayerArgs {
    /**
     * Activation function to use for the recurrent step.
     *
     * Defaults to hard sigmoid (`hardSigmoid`).
     *
     * If `null`, no activation is applied.
     */
    recurrentActivation?: ActivationIdentifier;
    /**
     * If `true`, add 1 to the bias of the forget gate at initialization.
     * Setting it to `true` will also force `biasInitializer = 'zeros'`.
     * This is recommended in
     * [Jozefowicz et
     * al.](http://www.jmlr.org/proceedings/papers/v37/jozefowicz15.pdf).
     */
    unitForgetBias?: boolean;
    /**
     * Implementation mode, either 1 or 2.
     *   Mode 1 will structure its operations as a larger number of
     *   smaller dot products and additions, whereas mode 2 will
     *   batch them into fewer, larger operations. These modes will
     *   have different performance profiles on different hardware and
     *   for different applications.
     *
     * Note: For superior performance, TensorFlow.js always uses implementation
     * 2, regardless of the actual value of this config field.
     */
    implementation?: number;
}
export declare class LSTM extends RNN {
    /** @nocollapse */
    static className: string;
    constructor(args: LSTMLayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict): T;
}
export declare interface StackedRNNCellsArgs extends LayerArgs {
    /**
     * A `Array` of `RNNCell` instances.
     */
    cells: RNNCell[];
}
export declare class StackedRNNCells extends RNNCell {
    /** @nocollapse */
    static className: string;
    protected cells: RNNCell[];
    constructor(args: StackedRNNCellsArgs);
    readonly stateSize: number[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    build(inputShape: Shape | Shape[]): void;
    getConfig(): serialization.ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict, customObjects?: serialization.ConfigDict): T;
    readonly trainableWeights: LayerVariable[];
    readonly nonTrainableWeights: LayerVariable[];
    /**
     * Retrieve the weights of a the model.
     *
     * @returns A flat `Array` of `tf.Tensor`s.
     */
    getWeights(): Tensor[];
    /**
     * Set the weights of the model.
     *
     * @param weights An `Array` of `tf.Tensor`s with shapes and types matching
     *     the output of `getWeights()`.
     */
    setWeights(weights: Tensor[]): void;
}
export declare function generateDropoutMask(args: {
    ones: () => tfc.Tensor;
    rate: number;
    training?: boolean;
    count?: number;
}): tfc.Tensor | tfc.Tensor[];
