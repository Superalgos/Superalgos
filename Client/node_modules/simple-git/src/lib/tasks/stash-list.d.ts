import { LogOptions, LogResult } from '../../../typings';
import { StringTask } from '../types';
export declare function stashListTask(opt: LogOptions<import("./log").DefaultLogFields> | undefined, customArgs: string[]): StringTask<LogResult>;
