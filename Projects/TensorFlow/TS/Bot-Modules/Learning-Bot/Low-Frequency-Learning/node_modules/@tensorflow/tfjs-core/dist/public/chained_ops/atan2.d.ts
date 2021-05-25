import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        atan2<T extends Tensor>(b: Tensor | TensorLike): T;
    }
}
