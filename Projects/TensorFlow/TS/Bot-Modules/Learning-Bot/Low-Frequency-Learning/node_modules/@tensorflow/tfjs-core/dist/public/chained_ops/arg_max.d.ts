import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        argMax<T extends Tensor>(axis?: number): T;
    }
}
