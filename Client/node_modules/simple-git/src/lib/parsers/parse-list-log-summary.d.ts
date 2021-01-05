import { LogResult } from '../../../typings';
export declare const START_BOUNDARY = "\u00F2\u00F2\u00F2\u00F2\u00F2\u00F2 ";
export declare const COMMIT_BOUNDARY = " \u00F2\u00F2";
export declare const SPLITTER = " \u00F2 ";
export declare function createListLogSummaryParser<T = any>(splitter?: string, fields?: string[]): (stdOut: string) => LogResult<T>;
