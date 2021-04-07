import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        notEqual<T extends Tensor>(b: Tensor | TensorLike): T;
    }
}
