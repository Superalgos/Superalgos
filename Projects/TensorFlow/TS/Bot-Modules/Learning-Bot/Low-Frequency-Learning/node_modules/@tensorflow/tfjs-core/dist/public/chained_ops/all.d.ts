import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        all<T extends Tensor>(this: T, axis?: number | number[], keepDims?: boolean): T;
    }
}
