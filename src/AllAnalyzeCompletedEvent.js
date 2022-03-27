class AllAnalyzeCompleted {
  constructor(result, source) {
    this._result = result;
    this._source = source;
  }

  get result() {
    return this._result;
  }

  get source() {
    return this._source;
  }
}

module.exports = {
  class: AllAnalyzeCompleted,
}
