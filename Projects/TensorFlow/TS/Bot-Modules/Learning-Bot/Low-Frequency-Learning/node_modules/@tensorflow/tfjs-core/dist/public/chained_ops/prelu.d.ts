import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        prelu<T extends Tensor>(alpha: T | TensorLike): T;
    }
}
