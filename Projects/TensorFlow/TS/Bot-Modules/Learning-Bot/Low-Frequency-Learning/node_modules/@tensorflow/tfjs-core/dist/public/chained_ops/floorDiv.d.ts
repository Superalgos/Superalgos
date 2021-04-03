import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        floorDiv<T extends Tensor>(b: Tensor | TensorLike): T;
    }
}
