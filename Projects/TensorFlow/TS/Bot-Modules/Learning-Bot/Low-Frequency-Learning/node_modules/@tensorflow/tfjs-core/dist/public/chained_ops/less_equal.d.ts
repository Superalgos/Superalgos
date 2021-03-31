import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        lessEqual<T extends Tensor>(b: Tensor | TensorLike): T;
    }
}
