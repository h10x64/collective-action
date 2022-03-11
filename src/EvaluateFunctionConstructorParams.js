/**
 * CLASSES
 */
class EvaluateFunctionConstructorParams {
  constructor(name, urlRegex, func, waitUntil) {
    this.name = name;
    this.urlRegex = urlRegex;
    this.func = func;
    this.waitUntil = waitUntil;
  }
}

module.exports = {
  class: EvaluateFunctionConstructorParams
};
