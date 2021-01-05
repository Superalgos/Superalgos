import { CommitResult } from '../../../typings';
import { StringTask } from '../types';
export declare function commitTask(message: string[], files: string[], customArgs: string[]): StringTask<CommitResult>;
