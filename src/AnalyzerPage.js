/**
 * REQUIREMENTS
 */
const AnalyzerQueue = require("./AnalyzerQueue");

/**
 * CLASSES
 */
class AnalyzerPage {
  constructor(params) {
    this.puppeteerPage = params.puppeteerPage;
    this.evaluateFunctions = params.evaluateFunctions;
    this.queues = params.queues;
    this.analyzingURL = undefined;
  }

  async analyzeURL(url) {
    let ret = {};
    let regexFilter = (evaluateFunc, idx, arr) => {
      return url.match(evaluateFunc);
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

    return ret;
  }

  async analyze() {
    let result = undefined;

    while (this.queues.filter(AnalyzerQueue.ANALYZER_FILTER_FUNC_UNANALYZED).length > 0) {
      let nextQueue = this.queues.filter(AnalyzerQueue.ANALYZER_FILTER_FUNC_UNANALYZED).shift();
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
}

module.exports = {
  class: AnalyzerPage
};
