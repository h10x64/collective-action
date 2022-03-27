const {workerData, parentPort} = require("worker_threads");
const CollectiveActionModule = require("../../../index");
const CollectiveAction = CollectiveActionModule.CollectiveAction;
const EvaluateFunction = CollectiveActionModule.EvaluateFunction;

class CollectiveActionThread {
  constructor(_parentPort, workerData) {
    const name = workerData.name;
    const evaluateScriptFiles = workerData.evaluateScriptFiles;
    const concurrentPageNumber = workerData.concurrentPageNumber;

    this._parentPort = _parentPort;

    this.name = name ? name : "Worker_" + new String(Math.round((Date.now() + Math.random()) * 1000) / 1000)

    this.evaluateScriptFiles = evaluateScriptFiles;
    this.evalScripts = [];
    for (let i in this.evaluateScriptFiles) {
      let loaded = require(evaluateScriptFiles[i].path);
      if (loaded instanceof Function) {
        this.evalScripts.push(new EvaluateFunction({
          name: evaluateScriptFiles[i].name,
          functions: {
            eval: loaded,
          },
        }));
      }
    }

    this.concurrentPageNumber = concurrentPageNumber;

    this.collectiveAction = new CollectiveAction({
      evaluateFunctions: this.evalScripts,
      concurrentPageNumber: this.concurrentPageNumber,
    });

    this.collectiveAction.addAnalyzedEventListener((evt)=>{
      this.onanalyzed(evt);
    });
    this.collectiveAction.addAllAnalyzeCompletedEventListener((evt)=>{
      this.onallanalyzecompleted(evt);
    });
    
    this._parentPort.on("message", (message) => {
      this.onMessage(message);
    });
  };

  get MESSAGE_TYPES() {
    return {
      INIT: "INIT",
      GET_INFO: "GET_INFO",
      PUSH: "PUSH",
      CANCEL: "CANCEL",
      RUN: "RUN",
      INTERRUPT: "INTERRUPT",
      RESUME: "RESUME",
      ABORT: "ABORT",
      CLOSE: "CLOSE",
      SUCCEEDED: "SUCCEEDED",
      FAILED: "FAILED",
      ANALYZED: "ANALYZED",
      ALL_ANALYZE_COMPLETED: "ALL_ANALYZE_COMPLETED",
      UNKNOWN_COMMAND: "UNKNOWN_COMMAND",
    };
  }

  async init() {
    return await this.collectiveAction.init();
  }

  async getInfo() {
    const total = this.collectiveAction.queues.length;
    const analyzedTotal = this.collectiveAction.analyzedQueues.length;

    const ret = {
      total: total,
      analyzed: analyzedTotal,
      progress: (analyzedTotal / total),
    };

    return ret;
  }

  async push(url) {
    return await this.collectiveAction.push(url);
  }

  async cancel(url) {
    return await this.collectiveAction.cancel(url);
  }

  async run() {
    return await this.collectiveAction.run();
  }

  async resume() {
    return await this.collectiveAction.resume();
  }

  async abort() {
    return await this.collectiveAction.abort();
  }

  async close() {
    return await this.collectiveAction.close();
  }

  onMessage(message) {
    const type = message.type;
    const body = message.body;

    switch (type) {
      case this.MESSAGE_TYPES.INIT: {
        this.init().then((res)=>{
          this._parentPort.postMessage({
            type: this.MESSAGE_TYPES.INIT,
            status: this.MESSAGE_TYPES.SUCCEEDED,
            body: {
              message: message,
              response: res,
            }
          });
        }).catch((err) => {
          this._parentPort.postMessage({
            type: this.MESSAGE_TYPES.INIT,
            status: this.MESSAGE_TYPES.FAILED,
            body: {
              error: err,
              message: message,
            },
          });
        });
        break;
      }

      case this.MESSAGE_TYPES.GET_INFO: {
        this._parentPort.postMessage({
          type: this.MESSAGE_TYPES.GET_INFO,
          status: this.MESSAGE_TYPES.SUCCEEDED,
          body: this.getInfo(),
        });
        break;
      }

      case this.MESSAGE_TYPES.PUSH: {
        this.push(body.url).then((res)=>{
          this._parentPort.postMessage({
            type: this.MESSAGE_TYPES.PUSH,
            status: this.MESSAGE_TYPES.SUCCEEDED,
            body: {
              message: message,
              response: res,
            },
          });
        }).catch((err)=> {
          throw {
            type: this.MESSAGE_TYPES.PUSH,
            status: this.MESSAGE_TYPES.FAILED,
            body: {
              error: err,
              message: message,
            },
          };
        });
        break;
      }

      case this.MESSAGE_TYPES.CANCEL: {
        this.cancel(body.url).then((res)=>{
          this._parentPort.postMessage({
            type: this.MESSAGE_TYPES.CANCEL,
            status: this.MESSAGE_TYPES.SUCCEEDED,
            body: {
              response: res,
              message: message,
            }
          });
        }).catch((err)=>{
          throw {
            type: this.MESSAGE_TYPES.CANCEL,
            status: this.MESSAGE_TYPES.FAILED,
            body: {
              error: err,
              message: message,
            },
          };
        });
        break;
      }

      case this.MESSAGE_TYPES.RUN: {
        this.run();
        this._parentPort.postMessage({
          type: this.MESSAGE_TYPES.RUN,
          status: this.MESSAGE_TYPES.SUCCEEDED,
          body: {
            response: undefined,
            message: message,
          },
        });
        break;
      }

      case this.MESSAGE_TYPES.RESUME: {
        this.resume();
        this._parentPort.postMessage({
          type: this.MESSAGE_TYPES.RESUME,
          status: this.MESSAGE_TYPES.SUCCEEDED,
          body: {
            response: undefined,
            message: message,
          },
        });
        break;
      }

      case this.MESSAGE_TYPES.ABORT: {
        this.abort().then((res)=>{
          this._parentPort.postMessage({
            type: this.MESSAGE_TYPES.ABORT,
            status: this.MESSAGE_TYPES.SUCCEEDED,
            body: {
              response: res,
              message: message,
            },
          });
        }).catch((err)=>{
          throw {
            type: this.MESSAGE_TYPES.ABORT,
            status: this.MESSAGE_TYPES.FAILED,
            body: {
              error: err,
              message: message,
            },
          };
        });
        break;
      }

      case this.MESSAGE_TYPES.CLOSE: {
        this.close().then((res)  => {
          this._parentPort.postMessage({
            type: this.MESSAGE_TYPES.CLOSE,
            status: this.MESSAGE_TYPES.SUCCEEDED,
            body: {
              response: res,
              message: message,
            },
          })
        }).catch((err)=>{
          throw {
            type: this.MESSAGE_TYPES.CLOSE,
            status: this.MESSAGE_TYPES.FAILED,
            body: {
              error: err,
              message: message,
            },
          };
        });
        break;
      }

      default: {
        throw {
          type: this.MESSAGE_TYPES.UNKNOWN_COMMAND,
          status: this.MESSAGE_TYPES.FAILED,
          body: {
            error: this.MESSAGE_TYPES.UNKNOWN_COMMAND,
            message: message,
          },
        };
      }
    }
  }

  onanalyzed(evt) {
    this._parentPort.postMessage({
      type: this.MESSAGE_TYPES.ANALYZED,
      status: this.MESSAGE_TYPES.SUCCEEDED,
      body: evt.result,
    });
  }

  onallanalyzecompleted(evt) {
    const analyzedQueues = this.collectiveAction.analyzedQueues;
    const res = [];

    for (let i in analyzedQueues) {
      const r = {
        url: analyzedQueues[i].url,
        result: analyzedQueues[i].result,
      };
      res.push(r);
    }

    this._parentPort.postMessage({
      type: this.MESSAGE_TYPES.ALL_ANALYZE_COMPLETED,
      status: this.MESSAGE_TYPES.SUCCEEDED,
      body: res,
    })
  }
}

function init() {
  const collectiveActionThread = new CollectiveActionThread(parentPort, workerData);
}

init();
