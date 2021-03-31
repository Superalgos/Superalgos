/**
 * ExecutionContext captures the runtime environment of the node. It keeps
 * track of the current frame and iteration for the control flow ops.
 *
 * For example, typical Dynamic RNN model may contain loops, for which
 * TensorFlow will generate graphs with Enter/Exit nodes to control the
 * current execution frame, and NextIteration Nodes for iteration id increment.
 * For model with branch logic, TensorFLow will generate Switch/Merge ops.
 */
export class ExecutionContext {
    constructor(weightMap = {}, tensorArrayMap = {}, tensorListMap = {}, functionMap = {}) {
        this.weightMap = weightMap;
        this.tensorArrayMap = tensorArrayMap;
        this.tensorListMap = tensorListMap;
        this.functionMap = functionMap;
        this.rootContext = { id: 0, frameName: '', iterationId: 0 };
        this.contexts = [this.rootContext];
        this.lastId = 0;
        this.generateCurrentContextIds();
    }
    newFrame(id, frameName) {
        return { id, frameName, iterationId: 0 };
    }
    /**
     * Set the current context
     * @param contexts: ExecutionContextInfo[] the current path of execution
     * frames
     */
    set currentContext(contexts) {
        if (this.contexts !== contexts) {
            this.contexts = contexts;
            this.generateCurrentContextIds();
        }
    }
    get currentContext() {
        return this.contexts;
    }
    /**
     * Returns the current context in string format.
     */
    get currentContextId() {
        return this._currentContextIds[0];
    }
    /**
     * Returns the current context and all parent contexts in string format.
     * This allow access to the nodes in the current and parent frames.
     */
    get currentContextIds() {
        return this._currentContextIds;
    }
    generateCurrentContextIds() {
        const names = [];
        for (let i = 0; i < this.contexts.length - 1; i++) {
            const contexts = this.contexts.slice(0, this.contexts.length - i);
            names.push(this.contextIdforContexts(contexts));
        }
        names.push('');
        this._currentContextIds = names;
    }
    contextIdforContexts(contexts) {
        return contexts ?
            contexts
                .map(context => (context.id === 0 && context.iterationId === 0) ?
                '' :
                `${context.frameName}-${context.iterationId}`)
                .join('/') :
            '';
    }
    /**
     * Enter a new frame, a new context is pushed on the current context list.
     * @param frameId new frame id
     */
    enterFrame(frameId) {
        if (this.contexts) {
            this.lastId++;
            this.contexts = this.contexts.slice();
            this.contexts.push(this.newFrame(this.lastId, frameId));
            this._currentContextIds.unshift(this.contextIdforContexts(this.contexts));
        }
    }
    /**
     * Exit the current frame, the last context is removed from the current
     * context list.
     */
    exitFrame() {
        if (this.contexts && this.contexts.length > 1) {
            this.contexts = this.contexts.slice();
            this.contexts.splice(-1);
            this.currentContextIds.shift();
        }
        else {
            throw new Error('Cannot exit frame, the context is empty');
        }
    }
    /**
     * Enter the next iteration of a loop, the iteration id of last context is
     * increased.
     */
    nextIteration() {
        if (this.contexts && this.contexts.length > 0) {
            this.contexts = this.contexts.slice();
            this.lastId++;
            const context = Object.assign({}, this.contexts[this.contexts.length - 1]);
            context.iterationId += 1;
            context.id = this.lastId;
            this.contexts.splice(-1, 1, context);
            this._currentContextIds.splice(0, 1, this.contextIdforContexts(this.contexts));
        }
        else {
            throw new Error('Cannot increase frame iteration, the context is empty');
        }
    }
    getWeight(name) {
        return this.weightMap[name];
    }
    addTensorArray(tensorArray) {
        this.tensorArrayMap[tensorArray.id] = tensorArray;
    }
    getTensorArray(id) {
        return this.tensorArrayMap[id];
    }
    addTensorList(tensorList) {
        this.tensorListMap[tensorList.id] = tensorList;
    }
    getTensorList(id) {
        return this.tensorListMap[id];
    }
    dispose(keepIds) {
        for (const key in this.tensorArrayMap) {
            this.tensorArrayMap[key].clearAndClose(keepIds);
        }
        for (const key in this.tensorListMap) {
            this.tensorListMap[key].clearAndClose(keepIds);
        }
    }
}
//# sourceMappingURL=execution_context.js.map