/**
 * CLASSES
 */
class AnalyzerPageConstructorParams {
  constructor(puppeteerPage, evaluateFunctions, queues) {
    this.puppeteerPage = puppeteerPage;
    this.evaluateFunctions = evaluateFunctions;
    this.queues = queues;
  }
}

module.exports = {
  class: AnalyzerPageConstructorParams
};
