/**
 * CLASSES
 */
class HeadlessSquadConstructorParams {
  constructor(puppeteerBrowser, evaluateFunctions, concurrentPageNumber) {
    this.puppeteerBrowser = puppeteerBrowser;
    this.evaluateFunctions = evaluateFunctions;
    this.concurrentPageNumber = concurrentPageNumber;
  }
}

module.exports = {
  class: HeadlessSquadConstructorParams
};
