/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import { Tensor2D } from '../tensor';
import { TensorLike } from '../types';
/**
 * @docalias (data: Tensor2D, c: Tensor2D, h: Tensor2D): [Tensor2D, Tensor2D]
 */
export declare type LSTMCellFunc = {
    (data: Tensor2D, c: Tensor2D, h: Tensor2D): [Tensor2D, Tensor2D];
};
/**
 * Computes the next states and outputs of a stack of LSTMCells.
 *
 * Each cell output is used as input to the next cell.
 *
 * Returns `[cellState, cellOutput]`.
 *
 * Derived from tf.contrib.rn.MultiRNNCell.
 *
 * @param lstmCells Array of LSTMCell functions.
 * @param data The input to the cell.
 * @param c Array of previous cell states.
 * @param h Array of previous cell outputs.
 *
 * @doc {heading: 'Operations', subheading: 'RNN'}
 */
declare function multiRNNCell_(lstmCells: LSTMCellFunc[], data: Tensor2D | TensorLike, c: Array<Tensor2D | TensorLike>, h: Array<Tensor2D | TensorLike>): [Tensor2D[], Tensor2D[]];
export declare const multiRNNCell: typeof multiRNNCell_;
export {};
