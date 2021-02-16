import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        relu<T extends Tensor>(): T;
    }
}
