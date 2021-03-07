"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusTask = void 0;
const StatusSummary_1 = require("../responses/StatusSummary");
function statusTask(customArgs) {
    return {
        format: 'utf-8',
        commands: ['status', '--porcelain', '-b', '-u', ...customArgs],
        parser(text) {
            return StatusSummary_1.parseStatusSummary(text);
        }
    };
}
exports.statusTask = statusTask;
//# sourceMappingURL=status.js.map