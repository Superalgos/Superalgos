import { FetchResult } from '../../../typings';
import { StringTask } from '../types';
export declare function fetchTask(remote: string, branch: string, customArgs: string[]): StringTask<FetchResult>;
