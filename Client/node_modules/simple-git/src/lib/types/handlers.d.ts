import { GitError } from '../errors/git-error';
/**
 * The node-style callback to a task accepts either two arguments with the first as a null
 * and the second as the data, or just one argument which is an error.
 */
export interface SimpleGitTaskCallback<T = string, E extends GitError = GitError> {
    (err: null, data: T): void;
    (err: E): void;
}
