/**
 * REQUIREMENTS
 */
const AnalyzerQueue = require("./AnalyzerQueue");
const AnalyzedEvent = require("./AnalyzedEvent");

/**
 * CLASSES
 */
class AnalyzerPage {
  constructor(params) {
    this.puppeteerPage = params.puppeteerPage;
    this.evaluateFunctions = params.evaluateFunctions;
    this.queues = params.queues;
    this.analyzingURL = undefined;
    this.interrupted = false;
    this.analyzedEventListeners = [];
  }

  addAnalyzedEventListener(listener) {
    if (!(listener.onanalyzed instanceof Function)) {
      if (!(listener instanceof Function)) {
        throw {message: "AnalyzedEventListener must be function or that has {obj}.onanalyzed method."};
      }
    }

    this.analyzedEventListeners.push(listener);
  }

  async interrupt() {
    this.interrupted = true;
  }

  async resume() {
    this.interrupted = false;
    return await this.analyze();
  }

  async analyzeURL(url) {
    let ret = {};

    let regexFilter = (evaluateFunc, idx, arr) => {
      return url.match(evaluateFunc.urlRegex);
    };

    let matchEvaluateFunctions = this.evaluateFunctions.filter(regexFilter);

    if (matchEvaluateFunctions.length > 0) {
      this.analyzingURL = url;

      for (let i in matchEvaluateFunctions) {
        let res = undefined;
        let evaluateFunc = matchEvaluateFunctions[i];
        let response = undefined;
        let doesSkipEvaluate = false;

        response = await this.puppeteerPage.goto(url, evaluateFunc.waitUntil);

        if (evaluateFunc.functions.prev) {
          doesSkipEvaluate = evaluateFunc.functions.prev(evaluateFunc, url, response);
        }
        if (!doesSkipEvaluate) {
          if (evaluateFunc.functions.eval) {
            res = await this.puppeteerPage.evaluate(evaluateFunc.functions.eval);
          }
          if (evaluateFunc.functions.after) {
            res = evaluateFunc.functions.after(evaluateFunc, res);
          }
        }

        ret[evaluateFunc.name] = res;
      }
    }

    this.fireAnalyzedEvent(ret);

    return ret;
  }

  async analyze() {
    let result = undefined;

    while (
      this.queues.filter(AnalyzerQueue.ANALYZER_FILTER_FUNC_UNANALYZED).length > 0
      || !this.interrupted
    ) {
      let nextQueue = this.queues.filter(AnalyzerQueue.ANALYZER_FILTER_FUNC_UNANALYZED).shift();
      if (!nextQueue) {
        break;
      }

      nextQueue.analyzing = true;
      try {
        result = await this.analyzeURL(nextQueue.url);

        nextQueue.result = result;
      } catch (err) {
        console.warn(err);
        nextQueue.result = err;
      } finally {
        nextQueue.analyzing = false;
      }
    }
  }

  fireAnalyzedEvent(result) {
    const evt = new AnalyzedEvent.class(
      result,
      this,
    );
    for (let i in this.analyzedEventListeners) {
      const listener = this.analyzedEventListeners[i];

      if (listener.onanalyzed instanceof Function) {
        listener.onanalyzed(evt);
      } else if (listener instanceof Function) {
        listener(evt);
      }
    }
  }
}

module.exports = {
  class: AnalyzerPage
};
