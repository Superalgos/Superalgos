import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        logicalAnd<T extends Tensor>(b: Tensor | TensorLike): T;
    }
}
