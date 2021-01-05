"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPatchTask = void 0;
const task_1 = require("./task");
function applyPatchTask(patches, customArgs) {
    return task_1.straightThroughStringTask(['apply', ...customArgs, ...patches]);
}
exports.applyPatchTask = applyPatchTask;
//# sourceMappingURL=apply-patch.js.map