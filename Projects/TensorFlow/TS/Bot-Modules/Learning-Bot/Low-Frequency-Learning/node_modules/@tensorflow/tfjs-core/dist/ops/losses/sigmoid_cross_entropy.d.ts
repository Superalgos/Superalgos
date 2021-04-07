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
import { Tensor } from '../../tensor';
import { TensorLike } from '../../types';
import { Reduction } from '../loss_ops_utils';
/**
 * Computes the sigmoid cross entropy loss between two tensors.
 *
 * If labelSmoothing is nonzero, smooth the labels towards 1/2:
 *
 *   newMulticlassLabels = multiclassLabels * (1 - labelSmoothing)
 *                         + 0.5 * labelSmoothing
 *
 * @param multiClassLabels The ground truth output tensor of shape
 * [batch_size, num_classes], same dimensions as 'predictions'.
 * @param logits The predicted outputs.
 * @param weights Tensor whose rank is either 0, or the same rank as
 *    `labels`, and must be broadcastable to `labels` (i.e., all dimensions
 *    must be either `1`, or the same as the corresponding `losses`
 *    dimension).
 * @param labelSmoothing If greater than 0, then smooth the labels.
 * @param reduction Type of reduction to apply to loss. Should be of type
 *    `Reduction`
 *
 * @doc { heading: 'Training', subheading: 'Losses', namespace: 'losses' }
 */
declare function sigmoidCrossEntropy_<T extends Tensor, O extends Tensor>(multiClassLabels: T | TensorLike, logits: T | TensorLike, weights?: Tensor | TensorLike, labelSmoothing?: number, reduction?: Reduction): O;
export declare const sigmoidCrossEntropy: typeof sigmoidCrossEntropy_;
export {};
