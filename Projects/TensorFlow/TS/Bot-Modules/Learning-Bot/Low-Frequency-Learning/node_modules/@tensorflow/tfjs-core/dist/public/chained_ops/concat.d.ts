import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        concat<T extends Tensor>(tensors: T | Array<T | TensorLike>, axis?: number): T;
    }
}
