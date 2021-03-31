/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { BaseSerialization } from './types';
export declare type L1L2Config = {
    l1?: number;
    l2?: number;
};
export declare type L1L2Serialization = BaseSerialization<'L1L2', L1L2Config>;
export declare type RegularizerSerialization = L1L2Serialization;
export declare type RegularizerClassName = RegularizerSerialization['class_name'];
/**
 * A string array of valid Regularizer class names.
 *
 * This is guaranteed to match the `RegularizerClassName` union type.
 */
export declare const regularizerClassNames: RegularizerClassName[];
