import { Options, StringTask } from '../types';
import { LogResult } from '../../../typings';
export interface DefaultLogFields {
    hash: string;
    date: string;
    message: string;
    refs: string;
    body: string;
    author_name: string;
    author_email: string;
}
export declare type LogOptions<T = DefaultLogFields> = {
    file?: string;
    format?: T;
    from?: string;
    maxCount?: number;
    multiLine?: boolean;
    splitter?: string;
    strictDate?: boolean;
    symmetric?: boolean;
    to?: string;
};
export declare function parseLogOptions<T extends Options>(opt?: LogOptions<T>, customArgs?: string[]): {
    fields: string[];
    splitter: string;
    commands: string[];
};
export declare function logTask<T>(splitter: string, fields: string[], customArgs: string[]): StringTask<LogResult<T>>;
