"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitTask = void 0;
const parse_commit_1 = require("../parsers/parse-commit");
function commitTask(message, files, customArgs) {
    const commands = ['commit'];
    message.forEach((m) => commands.push('-m', m));
    commands.push(...files, ...customArgs);
    return {
        commands,
        format: 'utf-8',
        parser: parse_commit_1.parseCommitResult,
    };
}
exports.commitTask = commitTask;
//# sourceMappingURL=commit.js.map