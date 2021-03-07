import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        maximum<T extends Tensor>(b: Tensor | TensorLike): T;
    }
}
