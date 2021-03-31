/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { DataType, Scalar, serialization, Tensor } from '@tensorflow/tfjs-core';
import { Constraint } from '../constraints';
import { Initializer } from '../initializers';
import { Shape } from '../keras_format/common';
import { Regularizer } from '../regularizers';
import { Kwargs, RegularizerFn } from '../types';
import { LayerVariable } from '../variables';
export declare type Op = (x: LayerVariable) => LayerVariable;
/**
 * Constructor arguments for InputSpec.
 */
export interface InputSpecArgs {
    /** Expected datatype of the input. */
    dtype?: DataType;
    /** Expected shape of the input (may include null for unchecked axes). */
    shape?: Shape;
    /** Expected rank of the input. */
    ndim?: number;
    /** Maximum rank of the input. */
    maxNDim?: number;
    /** Minimum rank of the input. */
    minNDim?: number;
    /** Dictionary mapping integer axes to a specific dimension value. */
    axes?: {
        [axis: number]: number;
    };
}
/**
 * Specifies the ndim, dtype and shape of every input to a layer.
 *
 * Every layer should expose (if appropriate) an `inputSpec` attribute:
 * a list of instances of InputSpec (one per input tensor).
 *
 * A null entry in a shape is compatible with any dimension,
 * a null shape is compatible with any shape.
 */
export declare class InputSpec {
    /** Expected datatype of the input. */
    dtype?: DataType;
    /** Expected shape of the input (may include null for unchecked axes). */
    shape?: Shape;
    /** Expected rank of the input. */
    ndim?: number;
    /** Maximum rank of the input. */
    maxNDim?: number;
    /** Minimum rank of the input. */
    minNDim?: number;
    /** Dictionary mapping integer axes to a specific dimension value. */
    axes?: {
        [axis: number]: number;
    };
    constructor(args: InputSpecArgs);
}
/**
 * `tf.SymbolicTensor` is a placeholder for a Tensor without any concrete value.
 *
 * They are most often encountered when building a graph of `Layer`s for a
 * a `tf.LayersModel` and the input data's shape, but not values are known.
 *
 * @doc {heading: 'Models', 'subheading': 'Classes'}
 */
export declare class SymbolicTensor {
    readonly dtype: DataType;
    readonly shape: Shape;
    sourceLayer: Layer;
    readonly inputs: SymbolicTensor[];
    readonly callArgs: Kwargs;
    readonly outputTensorIndex?: number;
    readonly id: number;
    readonly name: string;
    readonly originalName?: string;
    /**
     * Rank/dimensionality of the tensor.
     */
    readonly rank: number;
    /**
     * Replacement for _keras_history.
     */
    nodeIndex: number;
    /**
     * Replacement for _keras_history.
     */
    tensorIndex: number;
    /**
     *
     * @param dtype
     * @param shape
     * @param sourceLayer The Layer that produced this symbolic tensor.
     * @param inputs The inputs passed to sourceLayer's __call__() method.
     * @param nodeIndex
     * @param tensorIndex
     * @param callArgs The keyword arguments passed to the __call__() method.
     * @param name
     * @param outputTensorIndex The index of this tensor in the list of outputs
     *   returned by apply().
     */
    constructor(dtype: DataType, shape: Shape, sourceLayer: Layer, inputs: SymbolicTensor[], callArgs: Kwargs, name?: string, outputTensorIndex?: number);
}
/**
 * Constructor arguments for Node.
 */
export interface NodeArgs {
    /**
     * The layer that takes `inputTensors` and turns them into `outputTensors`.
     * (the node gets created when the `call` method of the layer is called).
     */
    outboundLayer: Layer;
    /**
     * A list of layers, the same length as `inputTensors`, the layers from where
     * `inputTensors` originate.
     */
    inboundLayers: Layer[];
    /**
     * A list of integers, the same length as `inboundLayers`. `nodeIndices[i]` is
     * the origin node of `inputTensors[i]` (necessary since each inbound layer
     * might have several nodes, e.g. if the layer is being shared with a
     * different data stream).
     */
    nodeIndices: number[];
    /**
     * A list of integers, the same length as `inboundLayers`. `tensorIndices[i]`
     * is the index of `inputTensors[i]` within the output of the inbound layer
     * (necessary since each inbound layer might have multiple tensor outputs,
     * with each one being independently manipulable).
     */
    tensorIndices: number[];
    /** List of input tensors. */
    inputTensors: SymbolicTensor[];
    /** List of output tensors. */
    outputTensors: SymbolicTensor[];
    /** List of input masks (a mask can be a tensor, or null). */
    inputMasks: Tensor[];
    /** List of output masks (a mask can be a tensor, or null). */
    outputMasks: Tensor[];
    /** List of input shape tuples. */
    inputShapes: Shape | Shape[];
    /** List of output shape tuples. */
    outputShapes: Shape | Shape[];
}
/**
 * The type of the return value of Layer.dispose() and Container.dispose().
 */
export interface DisposeResult {
    /**
     * Reference count after the dispose call.
     */
    refCountAfterDispose: number;
    /**
     * Number of variables dispose in this dispose call.
     */
    numDisposedVariables: number;
}
/**
 * A `Node` describes the connectivity between two layers.
 *
 * Each time a layer is connected to some new input,
 * a node is added to `layer.inboundNodes`.
 *
 * Each time the output of a layer is used by another layer,
 * a node is added to `layer.outboundNodes`.
 *
 * `nodeIndices` and `tensorIndices` are basically fine-grained coordinates
 * describing the origin of the `inputTensors`, verifying the following:
 *
 * `inputTensors[i] ==
 * inboundLayers[i].inboundNodes[nodeIndices[i]].outputTensors[
 *   tensorIndices[i]]`
 *
 * A node from layer A to layer B is added to:
 *     A.outboundNodes
 *     B.inboundNodes
 */
export declare class Node {
    callArgs?: Kwargs;
    /**
     * The layer that takes `inputTensors` and turns them into `outputTensors`
     * (the node gets created when the `call` method of the layer is called).
     */
    outboundLayer: Layer;
    /**
     * A list of layers, the same length as `inputTensors`, the layers from where
     * `inputTensors` originate.
     */
    inboundLayers: Layer[];
    /**
     * A list of integers, the same length as `inboundLayers`. `nodeIndices[i]` is
     * the origin node of `inputTensors[i]` (necessary since each inbound layer
     * might have several nodes, e.g. if the layer is being shared with a
     * different data stream).
     */
    nodeIndices: number[];
    /**
     * A list of integers, the same length as `inboundLayers`. `tensorIndices[i]`
     * is the index of `inputTensors[i]` within the output of the inbound layer
     * (necessary since each inbound layer might have multiple tensor outputs,
     * with each one being independently manipulable).
     */
    tensorIndices: number[];
    /** List of input tensors. */
    inputTensors: SymbolicTensor[];
    /** List of output tensors. */
    outputTensors: SymbolicTensor[];
    /** List of input masks (a mask can be a tensor, or null). */
    inputMasks: Tensor[];
    /** List of output masks (a mask can be a tensor, or null). */
    outputMasks: Tensor[];
    /** List of input shape tuples. */
    inputShapes: Shape | Shape[];
    /** List of output shape tuples. */
    outputShapes: Shape | Shape[];
    readonly id: number;
    constructor(args: NodeArgs, callArgs?: Kwargs);
    getConfig(): serialization.ConfigDict;
}
/** Constructor arguments for Layer. */
export declare interface LayerArgs {
    /**
     * If defined, will be used to create an input layer to insert before this
     * layer. If both `inputShape` and `batchInputShape` are defined,
     * `batchInputShape` will be used. This argument is only applicable to input
     * layers (the first layer of a model).
     */
    inputShape?: Shape;
    /**
     * If defined, will be used to create an input layer to insert before this
     * layer. If both `inputShape` and `batchInputShape` are defined,
     * `batchInputShape` will be used. This argument is only applicable to input
     * layers (the first layer of a model).
     */
    batchInputShape?: Shape;
    /**
     * If `inputShape` is specified and `batchInputShape` is *not* specified,
     * `batchSize` is used to construct the `batchInputShape`: `[batchSize,
     * ...inputShape]`
     */
    batchSize?: number;
    /**
     * The data-type for this layer. Defaults to 'float32'.
     * This argument is only applicable to input layers (the first layer of a
     * model).
     */
    dtype?: DataType;
    /** Name for this layer. */
    name?: string;
    /**
     * Whether the weights of this layer are updatable by `fit`.
     * Defaults to true.
     */
    trainable?: boolean;
    /**
     * Initial weight values of the layer.
     */
    weights?: Tensor[];
    /** Legacy support. Do not use for new code. */
    inputDType?: DataType;
}
export declare type CallHook = (inputs: Tensor | Tensor[], kwargs: Kwargs) => void;
/**
 * A layer is a grouping of operations and weights that can be composed to
 * create a `tf.LayersModel`.
 *
 * Layers are constructed by using the functions under the
 * [tf.layers](#Layers-Basic) namespace.
 *
 * @doc {heading: 'Layers', subheading: 'Classes', namespace: 'layers'}
 */
export declare abstract class Layer extends serialization.Serializable {
    /** Name for this layer. Must be unique within a model. */
    name: string;
    /**
     * List of InputSpec class instances.
     *
     * Each entry describes one required input:
     * - ndim
     * - dtype
     * A layer with `n` input tensors must have an `inputSpec` of length `n`.
     */
    inputSpec: InputSpec[];
    supportsMasking: boolean;
    /** Whether the layer weights will be updated during training. */
    protected trainable_: boolean;
    batchInputShape: Shape;
    dtype: DataType;
    initialWeights: Tensor[];
    inboundNodes: Node[];
    outboundNodes: Node[];
    activityRegularizer: Regularizer;
    protected _trainableWeights: LayerVariable[];
    private _nonTrainableWeights;
    private _losses;
    private _updates;
    private _built;
    private _callHook;
    private _addedWeightNames;
    readonly id: number;
    protected _stateful: boolean;
    protected _refCount: number | null;
    private fastWeightInitDuringBuild;
    constructor(args?: LayerArgs);
    /**
     * Converts a layer and its index to a unique (immutable type) name.
     * This function is used internally with `this.containerNodes`.
     * @param layer The layer.
     * @param nodeIndex The layer's position (e.g. via enumerate) in a list of
     *   nodes.
     *
     * @returns The unique name.
     */
    protected static nodeKey(layer: Layer, nodeIndex: number): string;
    /**
     * Returns this.inboundNode at index nodeIndex.
     *
     * Porting note: This is a replacement for _get_node_attribute_at_index()
     * @param nodeIndex
     * @param attrName The name of the attribute related to request for this node.
     */
    private getNodeAtIndex;
    /**
     * Retrieves the input tensor(s) of a layer at a given node.
     *
     * @param nodeIndex Integer, index of the node from which to retrieve the
     *   attribute. E.g. `nodeIndex=0` will correspond to the first time the layer
     *   was called.
     *
     * @return A tensor (or list of tensors if the layer has multiple inputs).
     */
    getInputAt(nodeIndex: number): SymbolicTensor | SymbolicTensor[];
    /**
     * Retrieves the output tensor(s) of a layer at a given node.
     *
     * @param nodeIndex Integer, index of the node from which to retrieve the
     *   attribute. E.g. `nodeIndex=0` will correspond to the first time the layer
     *   was called.
     *
     * @return A tensor (or list of tensors if the layer has multiple outputs).
     */
    getOutputAt(nodeIndex: number): SymbolicTensor | SymbolicTensor[];
    /**
     * Retrieves the input tensor(s) of a layer.
     *
     * Only applicable if the layer has exactly one inbound node,
     * i.e. if it is connected to one incoming layer.
     *
     * @return Input tensor or list of input tensors.
     *
     * @exception AttributeError if the layer is connected to more than one
     *   incoming layers.
     */
    readonly input: SymbolicTensor | SymbolicTensor[];
    /**
     * Retrieves the output tensor(s) of a layer.
     *
     * Only applicable if the layer has exactly one inbound node,
     * i.e. if it is connected to one incoming layer.
     *
     * @return Output tensor or list of output tensors.
     *
     * @exception AttributeError if the layer is connected to more than one
     *   incoming layers.
     */
    readonly output: SymbolicTensor | SymbolicTensor[];
    readonly losses: RegularizerFn[];
    /**
     * Retrieves the Layer's current loss values.
     *
     * Used for regularizers during training.
     */
    calculateLosses(): Scalar[];
    readonly updates: Tensor[];
    built: boolean;
    trainable: boolean;
    trainableWeights: LayerVariable[];
    nonTrainableWeights: LayerVariable[];
    /**
     * The concatenation of the lists trainableWeights and nonTrainableWeights
     * (in this order).
     */
    readonly weights: LayerVariable[];
    readonly stateful: boolean;
    /**
     * Reset the states of the layer.
     *
     * This method of the base Layer class is essentially a no-op.
     * Subclasses that are stateful (e.g., stateful RNNs) should override this
     * method.
     */
    resetStates(): void;
    /**
     * Checks compatibility between the layer and provided inputs.
     *
     * This checks that the tensor(s) `input`
     * verify the input assumptions of the layer
     * (if any). If not, exceptions are raised.
     *
     * @param inputs Input tensor or list of input tensors.
     *
     * @exception ValueError in case of mismatch between
     *   the provided inputs and the expectations of the layer.
     */
    protected assertInputCompatibility(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[]): void;
    /**
     * This is where the layer's logic lives.
     *
     * @param inputs Input tensor, or list/tuple of input tensors.
     * @param kwargs Additional keyword arguments.
     *
     * @return A tensor or list/tuple of tensors.
     */
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    protected invokeCallHook(inputs: Tensor | Tensor[], kwargs: Kwargs): void;
    /**
     * Set call hook.
     * This is currently used for testing only.
     * @param callHook
     */
    setCallHook(callHook: CallHook): void;
    /**
     * Clear call hook.
     * This is currently used for testing only.
     */
    clearCallHook(): void;
    /**
     * Builds or executes a `Layer's logic.
     *
     * When called with `tf.Tensor`(s), execute the `Layer`s computation and
     * return Tensor(s). For example:
     *
     * ```js
     * const denseLayer = tf.layers.dense({
     *   units: 1,
     *   kernelInitializer: 'zeros',
     *   useBias: false
     * });
     *
     * // Invoke the layer's apply() method with a `tf.Tensor` (with concrete
     * // numeric values).
     * const input = tf.ones([2, 2]);
     * const output = denseLayer.apply(input);
     *
     * // The output's value is expected to be [[0], [0]], due to the fact that
     * // the dense layer has a kernel initialized to all-zeros and does not have
     * // a bias.
     * output.print();
     * ```
     *
     * When called with `tf.SymbolicTensor`(s), this will prepare the layer for
     * future execution.  This entails internal book-keeping on shapes of
     * expected Tensors, wiring layers together, and initializing weights.
     *
     * Calling `apply` with `tf.SymbolicTensor`s are typically used during the
     * building of non-`tf.Sequential` models. For example:
     *
     * ```js
     * const flattenLayer = tf.layers.flatten();
     * const denseLayer = tf.layers.dense({units: 1});
     *
     * // Use tf.layers.input() to obtain a SymbolicTensor as input to apply().
     * const input = tf.input({shape: [2, 2]});
     * const output1 = flattenLayer.apply(input);
     *
     * // output1.shape is [null, 4]. The first dimension is the undetermined
     * // batch size. The second dimension comes from flattening the [2, 2]
     * // shape.
     * console.log(JSON.stringify(output1.shape));
     *
     * // The output SymbolicTensor of the flatten layer can be used to call
     * // the apply() of the dense layer:
     * const output2 = denseLayer.apply(output1);
     *
     * // output2.shape is [null, 1]. The first dimension is the undetermined
     * // batch size. The second dimension matches the number of units of the
     * // dense layer.
     * console.log(JSON.stringify(output2.shape));
     *
     * // The input and output and be used to construct a model that consists
     * // of the flatten and dense layers.
     * const model = tf.model({inputs: input, outputs: output2});
     * ```
     *
     * @param inputs a `tf.Tensor` or `tf.SymbolicTensor` or an Array of them.
     * @param kwargs Additional keyword arguments to be passed to `call()`.
     *
     * @return Output of the layer's `call` method.
     *
     * @exception ValueError error in case the layer is missing shape information
     *   for its `build` call.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    apply(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], kwargs?: Kwargs): Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[];
    /**
     * Check compatibility between input shape and this layer's batchInputShape.
     *
     * Print warning if any incompatibility is found.
     *
     * @param inputShape Input shape to be checked.
     */
    protected warnOnIncompatibleInputShape(inputShape: Shape): void;
    /**
     * Retrieves the output shape(s) of a layer.
     *
     * Only applicable if the layer has only one inbound node, or if all inbound
     * nodes have the same output shape.
     *
     * @returns Output shape or shapes.
     * @throws AttributeError: if the layer is connected to more than one incoming
     *   nodes.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    readonly outputShape: Shape | Shape[];
    /**
     * Counts the total number of numbers (e.g., float32, int32) in the
     * weights.
     *
     * @returns An integer count.
     * @throws RuntimeError: If the layer is not built yet (in which case its
     *   weights are not defined yet.)
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    countParams(): number;
    /**
     * Creates the layer weights.
     *
     * Must be implemented on all layers that have weights.
     *
     * Called when apply() is called to construct the weights.
     *
     * @param inputShape A `Shape` or array of `Shape` (unused).
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    build(inputShape: Shape | Shape[]): void;
    /**
     * Returns the current values of the weights of the layer.
     *
     * @param trainableOnly Whether to get the values of only trainable weights.
     * @returns Weight values as an `Array` of `tf.Tensor`s.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    getWeights(trainableOnly?: boolean): Tensor[];
    /**
     * Sets the weights of the layer, from Tensors.
     *
     * @param weights a list of Tensors. The number of arrays and their shape
     *   must match number of the dimensions of the weights of the layer (i.e.
     *   it should match the output of `getWeights`).
     *
     * @exception ValueError If the provided weights list does not match the
     *   layer's specifications.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    setWeights(weights: Tensor[]): void;
    /**
     * Adds a weight variable to the layer.
     *
     * @param name Name of the new weight variable.
     * @param shape The shape of the weight.
     * @param dtype The dtype of the weight.
     * @param initializer An initializer instance.
     * @param regularizer A regularizer instance.
     * @param trainable Whether the weight should be trained via backprop or not
     *   (assuming that the layer itself is also trainable).
     * @param constraint An optional trainable.
     * @return The created weight variable.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    protected addWeight(name: string, shape: Shape, dtype?: DataType, initializer?: Initializer, regularizer?: Regularizer, trainable?: boolean, constraint?: Constraint): LayerVariable;
    /**
     * Set the fast-weight-initialization flag.
     *
     * In cases where the initialized weight values will be immediately
     * overwritten by loaded weight values during model loading, setting
     * the flag to `true` saves unnecessary calls to potentially expensive
     * initializers and speeds up the loading process.
     *
     * @param value Target value of the flag.
     */
    setFastWeightInitDuringBuild(value: boolean): void;
    /**
     * Add losses to the layer.
     *
     * The loss may potentionally be conditional on some inputs tensors,
     * for instance activity losses are conditional on the layer's inputs.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    addLoss(losses: RegularizerFn | RegularizerFn[]): void;
    /**
     * Computes the output shape of the layer.
     *
     * Assumes that the layer will be built to match that input shape provided.
     *
     * @param inputShape A shape (tuple of integers) or a list of shape tuples
     *   (one per output tensor of the layer). Shape tuples can include null for
     *   free dimensions, instead of an integer.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    /**
     * Computes an output mask tensor.
     *
     * @param inputs Tensor or list of tensors.
     * @param mask Tensor or list of tensors.
     *
     * @return null or a tensor (or list of tensors, one per output tensor of the
     * layer).
     */
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor | Tensor[];
    /**
     * Internal method to create an inbound node for the layer.
     *
     * @param inputTensors List of input tensors.
     * @param outputTensors List of output tensors.
     * @param inputMasks List of input masks (a mask can be a tensor, or null).
     * @param outputMasks List of output masks (a mask can be a tensor, or null).
     * @param inputShapes List of input shape tuples.
     * @param outputShapes List of output shape tuples.
     * @param kwargs Dictionary of keyword arguments that were passed to the
     *   `call` method of the layer at the call that created the node.
     */
    private addInboundNode;
    /**
     * Returns the config of the layer.
     *
     * A layer config is a TS dictionary (serializable)
     * containing the configuration of a layer.
     * The same layer can be reinstantiated later
     * (without its trained weights) from this configuration.
     *
     * The config of a layer does not include connectivity
     * information, nor the layer class name.  These are handled
     * by 'Container' (one layer of abstraction above).
     *
     * Porting Note: The TS dictionary follows TS naming standrds for
     * keys, and uses tfjs-layers type-safe Enums.  Serialization methods
     * should use a helper function to convert to the pythonic storage
     * standard. (see serialization_utils.convertTsToPythonic)
     *
     * @returns TS dictionary of configuration.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    getConfig(): serialization.ConfigDict;
    /**
     * Dispose the weight variables that this Layer instance holds.
     *
     * @returns {number} Number of disposed variables.
     */
    protected disposeWeights(): number;
    protected assertNotDisposed(): void;
    /**
     * Attempt to dispose layer's weights.
     *
     * This method decrease the reference count of the Layer object by 1.
     *
     * A Layer is reference-counted. Its reference count is incremented by 1
     * the first item its `apply()` method is called and when it becomes a part
     * of a new `Node` (through calling the `apply()`) method on a
     * `tf.SymbolicTensor`).
     *
     * If the reference count of a Layer becomes 0, all the weights will be
     * disposed and the underlying memory (e.g., the textures allocated in WebGL)
     * will be freed.
     *
     * Note: If the reference count is greater than 0 after the decrement, the
     * weights of the Layer will *not* be disposed.
     *
     * After a Layer is disposed, it cannot be used in calls such as `apply()`,
     * `getWeights()` or `setWeights()` anymore.
     *
     * @returns A DisposeResult Object with the following fields:
     *   - refCountAfterDispose: The reference count of the Container after this
     *     `dispose()` call.
     *   - numDisposedVariables: Number of `tf.Variable`s (i.e., weights) disposed
     *     during this `dispose()` call.
     * @throws {Error} If the layer is not built yet, or if the layer has already
     *   been disposed.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    dispose(): DisposeResult;
}
/**
 * Returns the list of input tensors necessary to compute `tensor`.
 *
 * Output will always be a list of tensors (potentially with 1 element).
 *
 * @param tensor The tensor to start from.
 * @param layer Origin layer of the tensor.
 * @param nodeIndex Origin node index of the tensor.
 *
 * @return Array of input tensors.
 */
export declare function getSourceInputs(tensor: SymbolicTensor, layer?: Layer, nodeIndex?: number): SymbolicTensor[];
