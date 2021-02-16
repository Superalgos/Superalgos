import { Tensor } from '../../tensor';
import { TensorLike } from '../../types';
import { Reduction } from '../loss_ops_utils';
/**
 * Computes the softmax cross entropy loss between two tensors.
 *
 * If labelSmoothing is nonzero, smooth the labels towards 1/2:
 *
 *   newOnehotLabels = onehotLabels * (1 - labelSmoothing)
 *                         + labelSmoothing / numClasses
 *
 * @param onehotLabels One hot encoded labels
 *    [batch_size, num_classes], same dimensions as 'predictions'.
 * @param logits The predicted outputs.
 * @param weights Tensor whose rank is either 0, or 1, and must be
 *    broadcastable to `loss`  of shape [batch_size]
 * @param labelSmoothing If greater than 0, then smooth the labels.
 * @param reduction Type of reduction to apply to loss. Should be of type
 *    `Reduction`
 *
 * @doc { heading: 'Training', subheading: 'Losses', namespace: 'losses' }
 */
declare function softmaxCrossEntropy_<T extends Tensor, O extends Tensor>(onehotLabels: T | TensorLike, logits: T | TensorLike, weights?: Tensor | TensorLike, labelSmoothing?: number, reduction?: Reduction): O;
export declare const softmaxCrossEntropy: typeof softmaxCrossEntropy_;
export {};
