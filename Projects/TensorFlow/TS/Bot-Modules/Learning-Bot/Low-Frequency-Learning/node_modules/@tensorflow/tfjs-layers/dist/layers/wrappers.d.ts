/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { serialization, Tensor } from '@tensorflow/tfjs-core';
import { Layer, LayerArgs, SymbolicTensor } from '../engine/topology';
import { BidirectionalMergeMode, Shape } from '../keras_format/common';
import { Kwargs } from '../types';
import { RegularizerFn } from '../types';
import { LayerVariable } from '../variables';
import { RNN } from './recurrent';
export declare interface WrapperLayerArgs extends LayerArgs {
    /**
     * The layer to be wrapped.
     */
    layer: Layer;
}
/**
 * Abstract wrapper base class.
 *
 * Wrappers take another layer and augment it in various ways.
 * Do not use this class as a layer, it is only an abstract base class.
 * Two usable wrappers are the `TimeDistributed` and `Bidirectional` wrappers.
 */
export declare abstract class Wrapper extends Layer {
    readonly layer: Layer;
    constructor(args: WrapperLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    trainable: boolean;
    readonly trainableWeights: LayerVariable[];
    readonly nonTrainableWeights: LayerVariable[];
    readonly updates: Tensor[];
    readonly losses: RegularizerFn[];
    getWeights(): Tensor[];
    setWeights(weights: Tensor[]): void;
    getConfig(): serialization.ConfigDict;
    setFastWeightInitDuringBuild(value: boolean): void;
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict, customObjects?: serialization.ConfigDict): T;
}
export declare class TimeDistributed extends Wrapper {
    /** @nocollapse */
    static className: string;
    constructor(args: WrapperLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}
export declare function checkBidirectionalMergeMode(value?: string): void;
export declare interface BidirectionalLayerArgs extends WrapperLayerArgs {
    /**
     * The instance of an `RNN` layer to be wrapped.
     */
    layer: RNN;
    /**
     * Mode by which outputs of the forward and backward RNNs are
     * combined. If `null` or `undefined`, the output will not be
     * combined, they will be returned as an `Array`.
     *
     * If `undefined` (i.e., not provided), defaults to `'concat'`.
     */
    mergeMode?: BidirectionalMergeMode;
}
export declare class Bidirectional extends Wrapper {
    /** @nocollapse */
    static className: string;
    mergeMode: BidirectionalMergeMode;
    private forwardLayer;
    private backwardLayer;
    private returnSequences;
    private returnState;
    private numConstants?;
    private _trainable;
    constructor(args: BidirectionalLayerArgs);
    trainable: boolean;
    getWeights(): Tensor[];
    setWeights(weights: Tensor[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    apply(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], kwargs?: Kwargs): Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    resetStates(states?: Tensor | Tensor[]): void;
    build(inputShape: Shape | Shape[]): void;
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor | Tensor[];
    readonly trainableWeights: LayerVariable[];
    readonly nonTrainableWeights: LayerVariable[];
    setFastWeightInitDuringBuild(value: boolean): void;
    getConfig(): serialization.ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict): T;
}
