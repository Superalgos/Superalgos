import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        pow<T extends Tensor>(exp: Tensor | TensorLike): T;
    }
}
