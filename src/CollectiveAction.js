/**
 * REQUIREMENTS
 */
const puppeteer = require("puppeteer");
const CollectiveActionConstructorParams = require("./CollectiveActionConstructorParams");
const AnalyzerPage = require("./AnalyzerPage");
const AnalyzerQueue = require("./AnalyzerQueue");
const EvaluateFunctionConstructorParams = require("./EvaluateFunctionConstructorParams");
const EvaluateFunction = require("./EvaluateFunction");
const AnalyzedEvent = require("./AnalyzedEvent");
const AllAnalyzeCompletedEvent = require("./AllAnalyzeCompletedEvent");

/**
 * CLASSES
 */
class CollectiveAction {
  constructor(params) {
    this.puppeteerBrowser = params.puppeteerBrowser;
    this.evaluateFunctions = params.evaluateFunctions;
    this.concurrentPageNumber = (params.concurrentPageNumber != null) ? params.concurrentPageNumber : 10;
    this.analyzerPages = [];
    this.queues = [];
    this.analyzePromise = undefined;
    this.analyzedEventListeners = [];
    this.allAnalyzeCompletedEventListeners = [];
  }

  async init() {
    for (let i = 0; i < this.concurrentPageNumber; i++) {
      if (!this.puppeteerBrowser) {
        this.puppeteerBrowser = await puppeteer.launch();
      }

      const puppeteerPage = await this.puppeteerBrowser.newPage();
      const analyzerPage = new AnalyzerPage.class({
        puppeteerPage: puppeteerPage,
        evaluateFunctions: this.evaluateFunctions,
        queues: this.queues
      });
      analyzerPage.addAnalyzedEventListener(this);

      this.analyzerPages.push(analyzerPage);
    }
  }

  async push(url) {
    const queue = new AnalyzerQueue.class(url);
    this.queues.push(queue);
    return queue;
  }

  async cancel(url) {
    const cancelledQueues = [];

    for (let i = this.queues.length - 1; i > 0; i--) {
      const queue = this.queues[i];
      if (queue.url == url) {
        cancelledQueues.push(queue);
        this.queues.splice(i, 1);
      }
    }

    return cancelledQueues;
  }

  async analyzeAll() {
    this.analyzePromise = Promise.allSettled(this.analyzerPages.map(async (analyzerPage, idx, arr) => {
      await analyzerPage.analyze();
    }));
    this.analyzePromise.then((result) => {
      this.fireAllAnalyzeCompletedEvent(result);
    });
    return await this.analyzePromise;
  }

  async run() {
    return await this.analyzeAll();
  }

  async interrupt() {
    return await Promise.allSettled(this.analyzerPages.map(async (page, idx, arr)=>{
      return await page.interrupt();
    }));
  }

  async resume() {
    return await Promise.allSettled(this.analyzerPages.map(async (page, idx, arr)=>{
      return await page.resume();
    }));
  }

  async abort() {
    await this.interrupt();

    const cancelledQueues = [];
    for (let i in this.queues) {
      if (AnalyzerQueue.ANALYZER_FILTER_FUNC_UNANALYZED(this.queues[i], i, this.queues)) {
        cancelledQueues.push(this.queues[i]);
        this.queues.splice(i, 1);
      }
    }

    return cancelledQueues;
  }

  async await() {
    if (!this.analyzePromise) {
      return;
    }

    await this.analyzePromise;
  }

  async close() {
    await this.puppeteerBrowser.close();
  }

  onanalyzed(evt) {
    this.fireAnalyzedEvent(evt.result);
  }

  addAnalyzedEventListener(listener) {
    if (!(listener.onanalyzed instanceof Function)) {
      if (!(listener instanceof Function)) {
        throw {message: "listener must be function or has {obj}.onanalyzed method"};
      }
    }

    this.analyzedEventListeners.push(listener);
  }

  addAllAnalyzeCompletedEventListener(listener) {
    if (!(listener.onallanalyzecompleted instanceof Function)) {
      if (!(listener instanceof Function)) {
        throw {message: "listener must be function or has {obj}.onanalyzecompleted method"};
      }
    }

    this.allAnalyzeCompletedEventListeners.push(listener);
  }

  fireAnalyzedEvent(result) {
    const evt = new AnalyzedEvent.class(result, this);
    this._fireEvent(this.analyzedEventListeners, "onanalyzed", evt);
  }

  fireAllAnalyzeCompletedEvent(result) {
    const evt = new AllAnalyzeCompletedEvent.class(result, this);
    this._fireEvent(this.allAnalyzeCompletedEventListeners, "onallanalyzecomplete", evt);
  }

  _fireEvent(listeners, funcName, evt) {
    for (let i in listeners) {
      const listener = listeners[i];

      if (listener[funcName] instanceof Function) {
        listener[funcName](evt);
      } else if (listener instanceof Function) {
        listener(evt);
      }
    }
  }

  get unanalyzedQueues() {
    return this.queues.filter(AnalyzerQueue.ANALYZER_FILTER_FUNC_UNANALYZED);
  }

  get analyzedQueues() {
    return this.queues.filter(AnalyzerQueue.ANALYZER_FILTER_FUNC_ANALYZED);
  }

  get results() {
    let ret = [];
    let analyzedQueues = this.analyzedQueues;
    for (let i in analyzedQueues) {
      ret.push(analyzedQueues[i].result);
    }
    return ret;
  }
};

module.exports = {
  CollectiveAction: CollectiveAction,
  CollectiveActionConstructorParams: CollectiveActionConstructorParams.class,
  EvaluateFunction: EvaluateFunction.class,
  EvaluateFunctionConstructorParams: EvaluateFunctionConstructorParams.class,
};
