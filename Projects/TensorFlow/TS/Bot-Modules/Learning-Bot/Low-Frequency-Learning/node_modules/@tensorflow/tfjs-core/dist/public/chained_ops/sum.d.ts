import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        sum<T extends Tensor>(axis?: number | number[], keepDims?: boolean): T;
    }
}
