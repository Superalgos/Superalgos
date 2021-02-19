import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        argMin<T extends Tensor>(axis?: number): T;
    }
}
