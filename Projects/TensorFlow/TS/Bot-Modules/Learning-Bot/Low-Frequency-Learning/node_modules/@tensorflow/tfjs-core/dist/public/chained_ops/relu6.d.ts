import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        relu6<T extends Tensor>(): T;
    }
}
