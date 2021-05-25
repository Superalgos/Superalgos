import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        batchNorm<T extends Tensor>(mean: Tensor<R> | Tensor1D | TensorLike, variance: Tensor<R> | Tensor1D | TensorLike, offset?: Tensor<R> | Tensor1D | TensorLike, scale?: Tensor<R> | Tensor1D | TensorLike, varianceEpsilon?: number): Tensor<R>;
    }
}
