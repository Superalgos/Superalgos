import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        mean<T extends Tensor>(axis?: number | number[], keepDims?: boolean): T;
    }
}
