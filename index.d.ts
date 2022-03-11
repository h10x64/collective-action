declare module CollectiveAction {
  export class CollectiveAction<T0> {
    constructor(params: CollectiveActionConstructorParams);
    results: T0;
    unanalyzedQueues: AnalyzerQueue<any>[];
    analyzedQueues: AnalyzerQueue<any>[];
    async init: function():void;
    async push: function(string):void;
    async analyzeAll(): void;
    async await(): void;
    async close(): void;
  }

  export interface CollectiveActionConstructorParams {
    puppeteerBrowser: any;
    evaluateFunctions: EvaluateFunction[];
    concurrentPageNumber: number;
  }

  /**
   * evaluateFunctions = [
   *   {
   *     name: "evalFunc0",
   *     urlRegex: /https://example.com/(.*)/,
   *     functions: {
   *       prev: ((_this, url)=>{return false;}),
   *       eval: (()=>{return document.title}),
   *       after: ((_this, evalResponse)=>{{title: evalResponse}})  // returns T1 instance
   *     },
   *     waitUntil: "onload"
   *   },
   *   {
   *     name: "evalFunc1",
   *     ...
   *   },
   *   ...
   * ];
   * 
   * class T0 {
   *   evalFunc0: T1;
   *   evalFunc1: T2;
   *   ...
   * }
   * 
   */

  export class EvaluateFunction<Tn> {
    constructor(params: EvaluateFunctionConstructorParams<Tn>);
    name: string;
    urlRegex: RegExp;
    functions: EvalFunctions<Tn>;
    waitUntil: any;
  }

  export interface EvaluateFunctionConstructorParams<Tn> {
    name: string;
    urlRegex: RegExp;
    functions: EvalFunctions<Tn>;
    waitUntil: any;
  }

  export interface EvalFunctions<Tn> {
    prev: function(EvaluateFunction<Tn>, string): boolean | undefined;
    eval: function(): any | undefined;
    after: function(EvaluateFunction<Tn>, any): Tn | undefined;
  }
  
  export class AnalyzerQueue<T0> {
    constructor(url: string);
    url: string;
    analyzing: boolean;
    result: T0 | any;
  }
}
