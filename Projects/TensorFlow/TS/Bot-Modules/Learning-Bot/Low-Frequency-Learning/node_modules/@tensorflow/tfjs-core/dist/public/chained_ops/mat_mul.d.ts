import { Rank, TensorLike } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        matMul<T extends Tensor>(b: Tensor | TensorLike, transposeA?: boolean, transposeB?: boolean): Tensor;
    }
}
