/**
 * CONSTANTS
 */
const ANALYZER_FILTER_FUNC_UNANALYZED = (queue, idx, arr) => {
  return (queue.analyzing == false && queue.result == undefined);
};
const ANALYZER_FILTER_FUNC_ANALYZED = (queue, idx, arr) => {
  return (queue.analyzing == false && queue.result != undefined);
};

/**
 * CLASSES
 */
class AnalyzerQueue {
  constructor(url) {
    this.url = url;
    this.analyzing = false;
    this.result = undefined;
  }
}

module.exports = {
  ANALYZER_FILTER_FUNC_ANALYZED: ANALYZER_FILTER_FUNC_ANALYZED,
  ANALYZER_FILTER_FUNC_UNANALYZED: ANALYZER_FILTER_FUNC_UNANALYZED,
  class: AnalyzerQueue
};
