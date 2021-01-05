import { BufferTask, EmptyTaskParser, SimpleGitTask, SimpleGitTaskConfiguration, StringTask } from '../types';
export declare const EMPTY_COMMANDS: [];
export declare type EmptyTask<RESPONSE = void> = SimpleGitTaskConfiguration<RESPONSE, 'utf-8', string> & {
    commands: typeof EMPTY_COMMANDS;
    parser: EmptyTaskParser<RESPONSE>;
};
export declare function adhocExecTask<R>(parser: () => R): StringTask<R>;
export declare function configurationErrorTask(error: Error | string): EmptyTask;
export declare function straightThroughStringTask(commands: string[], trimmed?: boolean): StringTask<string>;
export declare function isBufferTask<R>(task: SimpleGitTask<R>): task is BufferTask<R>;
export declare function isEmptyTask<R>(task: SimpleGitTask<R>): task is EmptyTask;
