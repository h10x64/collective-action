/**
 * REQUIREMENTS
 */
const puppeteer = require("puppeteer");
const CollectiveActionConstructorParams = require("./CollectiveActionConstructorParams");
const AnalyzerPage = require("./AnalyzerPage");
const AnalyzerQueue = require("./AnalyzerQueue");
const EvaluateFunctionConstructorParams = require("./EvaluateFunctionConstructorParams");
const EvaluateFunction = require("./EvaluateFunction");

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
  }

  async init() {
    for (let i = 0; i < this.concurrentPageNumber; i++) {
      if (!this.puppeteerBrowser) {
      this.puppeteerBrowser = await puppeteer.launch();
      }
      let puppeteerPage = await this.puppeteerBrowser.newPage();
      this.analyzerPages.push(new AnalyzerPage.class({
      puppeteerPage: puppeteerPage,
      evaluateFunctions: this.evaluateFunctions,
      queues: this.queues
      }));
    }
  }

  async push(url) {
    this.queues.push(new AnalyzerQueue.class(url));
  }

  async analyzeAll() {
    this.analyzePromise = await Promise.all(this.analyzerPages.map(async (analyzerPage, idx, arr) => {
      await analyzerPage.analyze();
      this.analyzePromise = undefined;
    }));
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
