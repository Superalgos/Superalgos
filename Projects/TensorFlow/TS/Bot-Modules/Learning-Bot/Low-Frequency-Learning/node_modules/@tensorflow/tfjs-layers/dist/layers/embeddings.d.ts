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
 * TensorFlow.js Layers: Embedding Layer.
 *
 * Original source: keras/constraints.py
 */
import { serialization, Tensor } from '@tensorflow/tfjs-core';
import { Constraint, ConstraintIdentifier } from '../constraints';
import { Layer, LayerArgs } from '../engine/topology';
import { Initializer, InitializerIdentifier } from '../initializers';
import { Shape } from '../keras_format/common';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Kwargs } from '../types';
export declare interface EmbeddingLayerArgs extends LayerArgs {
    /**
     * Integer > 0. Size of the vocabulary, i.e. maximum integer index + 1.
     */
    inputDim: number;
    /**
     * Integer >= 0. Dimension of the dense embedding.
     */
    outputDim: number;
    /**
     * Initializer for the `embeddings` matrix.
     */
    embeddingsInitializer?: InitializerIdentifier | Initializer;
    /**
     * Regularizer function applied to the `embeddings` matrix.
     */
    embeddingsRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the activation.
     */
    activityRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Constraint function applied to the `embeddings` matrix.
     */
    embeddingsConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Whether the input value 0 is a special "padding" value that should be
     * masked out. This is useful when using recurrent layers which may take
     * variable length input.
     *
     * If this is `True` then all subsequent layers in the model need to support
     * masking or an exception will be raised. If maskZero is set to `True`, as a
     * consequence, index 0 cannot be used in the vocabulary (inputDim should
     * equal size of vocabulary + 1).
     */
    maskZero?: boolean;
    /**
     * Length of input sequences, when it is constant.
     *
     * This argument is required if you are going to connect `flatten` then
     * `dense` layers upstream (without it, the shape of the dense outputs cannot
     * be computed).
     */
    inputLength?: number | number[];
}
export declare class Embedding extends Layer {
    /** @nocollapse */
    static className: string;
    private inputDim;
    private outputDim;
    private embeddingsInitializer;
    private maskZero;
    private inputLength;
    private embeddings;
    readonly DEFAULT_EMBEDDINGS_INITIALIZER: InitializerIdentifier;
    private readonly embeddingsRegularizer?;
    private readonly embeddingsConstraint?;
    constructor(args: EmbeddingLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    protected warnOnIncompatibleInputShape(inputShape: Shape): void;
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
