import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        mod<T extends Tensor>(b: Tensor | TensorLike): T;
    }
}
