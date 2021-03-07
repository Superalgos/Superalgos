/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { DataFormat } from '../keras_format/common';
/**
 * Returns the value of the fuzz factor used in numeric expressions.
 */
export declare function epsilon(): number;
/**
 * Sets the value of the fuzz factor used in numeric expressions.
 * @param e New value of epsilon.
 */
export declare function setEpsilon(e: number): void;
/**
 * Returns the default image data format convention.
 */
export declare function imageDataFormat(): DataFormat;
