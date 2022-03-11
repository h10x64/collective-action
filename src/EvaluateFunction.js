/**
 * REQUIREMENT
 */
const EvalResult = require("./EvalResult");

/**
 * CLASSES
 */
class DefaultEvalResult extends EvalResult.class {
  constructor(isError, result) {
    super(isError);
    this.result = result;
  }
}

class EvaluateFunction {
  constructor(params) {
    // Default previous function. (Do not skip evaluation)
    let prevDefaultFunc = ((_this, url)=>{
      let doesSkipEvaluate = false;
      return doesSkipEvaluate;
    });
    // Default Evaluate function. (@see DefaultEvalResult, EvalResult)
    let evalDefaultFunc = (()=>{
      let isError = false;
      let result = "DONE";
      return new DefaultEvalResult(isError, result);
    });
    // Default after function (Do not anytihng)
    let afterDefaultFunc = ((_this, res)=>{
      return res
    });

    // Use default name(`${timestamp}.${random 3 digit}`) if this parameter isn't setted.
    this.name = params.name ? params.name : new String(Math.round((Date.now() + Math.random()) * 1000) / 1000);

    // Use default regex(/.*/) if this parameter isn't setted.
    this.urlRegex = params.urlRegex ? params.urlRegex : /.*/;

    if (!params.functions) {
      this.functions = {
        prev: prevDefaultFunc,
        eval: evalDefaultFunc,
        after: afterDefaultFunc,
      };
     } else {
      this.functions = params.functions;

      if (!this.functions.prev) {
        this.functions.prev = prevDefaultFunc;
      }
      if (!this.functions.eval) {
        this.functions.eval = evalDefaultFunc;
      }
      if (!this.functions.after) {
        this.functions.after = afterDefaultFunc;
      }
    }
    this.waitUntil = params.waitUntil;
  }
}

module.exports = {
  class: EvaluateFunction
};
