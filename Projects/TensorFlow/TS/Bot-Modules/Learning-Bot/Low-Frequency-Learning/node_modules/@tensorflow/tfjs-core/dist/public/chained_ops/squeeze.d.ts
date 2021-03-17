import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        squeeze<T extends Tensor>(axis?: number[]): T;
    }
}
