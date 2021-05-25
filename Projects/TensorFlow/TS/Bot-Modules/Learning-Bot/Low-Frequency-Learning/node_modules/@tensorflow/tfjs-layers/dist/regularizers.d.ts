/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { Scalar, serialization, Tensor } from '@tensorflow/tfjs-core';
/**
 * Regularizer base class.
 */
export declare abstract class Regularizer extends serialization.Serializable {
    abstract apply(x: Tensor): Scalar;
}
export interface L1L2Args {
    /** L1 regularization rate. Defaults to 0.01. */
    l1?: number;
    /** L2 regularization rate. Defaults to 0.01. */
    l2?: number;
}
export interface L1Args {
    /** L1 regularization rate. Defaults to 0.01. */
    l1: number;
}
export interface L2Args {
    /** L2 regularization rate. Defaults to 0.01. */
    l2: number;
}
export declare class L1L2 extends Regularizer {
    /** @nocollapse */
    static className: string;
    private readonly l1;
    private readonly l2;
    private readonly hasL1;
    private readonly hasL2;
    constructor(args?: L1L2Args);
    /**
     * Porting note: Renamed from __call__.
     * @param x Variable of which to calculate the regularization score.
     */
    apply(x: Tensor): Scalar;
    getConfig(): serialization.ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict): T;
}
export declare function l1(args?: L1Args): L1L2;
export declare function l2(args: L2Args): L1L2;
/** @docinline */
export declare type RegularizerIdentifier = 'l1l2' | string;
export declare const REGULARIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP: {
    [identifier in RegularizerIdentifier]: string;
};
export declare function serializeRegularizer(constraint: Regularizer): serialization.ConfigDictValue;
export declare function deserializeRegularizer(config: serialization.ConfigDict, customObjects?: serialization.ConfigDict): Regularizer;
export declare function getRegularizer(identifier: RegularizerIdentifier | serialization.ConfigDict | Regularizer): Regularizer;
