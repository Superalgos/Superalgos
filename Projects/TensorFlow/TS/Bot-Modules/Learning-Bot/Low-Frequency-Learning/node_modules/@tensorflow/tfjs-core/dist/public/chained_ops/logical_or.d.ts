import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        logicalOr<T extends Tensor>(b: Tensor | TensorLike): T;
    }
}
