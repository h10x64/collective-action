# Collective-action

Anyone can some "collective" action with puppeteer in asynchronously.  
( And you should not to be annoyance to anyone's to be, please )

```javascript

const CollectiveActionModule = require('collective-action');

const CollectiveAction = CollectiveActionModule.CollectiveAction;
const EvaluateFunction = CollectiveActionModule.EvaluateFunction;

async function init() {
  // Create new CollectiveAction !
  let collectiveAction = new CollectiveAction({
    // Evaluate settings
    evaluateFunctions: [
      new EvaluateFunction({
        name: "GooglePageTitle",
        // Regex about that filters analyze or not.
        urlRegex: /.*/,
        // Functions
        functions: {
          // This function will running in the before evaluation.
          prev: ((_this, url, response) => {
            // Skip evaluation when the status code isn't 200.
            let doesSkipEvaluate = (response._status != 200);

            console.log(`URL: ${url}`);
            console.log(`StatusCode: ${response._status}`);

            // It'll be skip evaluate if functions.prev returns 'True'.
            return doesSkipEvaluate;
          }),
          // Evaluation function.
          eval: (() => {
            return document.title;
          }),
          // This function will running in the after evaluation.
          after: ((_this, res) => {
            return res;
          })
        },
        // Puppeteer's waitUntil settings (this value uses in the "newPage" method)
        waitUntil: undefined
      }),
      // This one is a scraper that reads page titles in the search result
      new EvaluateFunction({
        name: "Results",
        urlRegex: /.*/,
        functions: {
          eval: (() => {
            let ret = []
            ret.push(document.body.innerText)
            let results = document.querySelectorAll(".LC20lb.MBeuO.DKV0Md");  // What is the ".LC20lb.MBeuO.DKV0Md" mean...? > GGL

            for (let i = 0; i < results.length; i++) {
              ret.push(results[i].innerText);
            }

            return ret;
          })
        },
        waitUntil: undefined
      })
    ],
    // How many puppeteer pages will be use in concurrentry. (Default: 10)
    concurrentPageNumber: 5
  });

  // Initialize this collective action.
  await collectiveAction.init();

  // google returns 10 result in 1 page * 15 times => get 150 results
  for (let i = 0; i < 15; i++) {
    // Pushing URL into the collectiveAction's queue
    ((start)=>{
      collectiveAction.push(`https://www.google.com/search?q=book&num=10&start=${(start * 10)}`);
    })(i);
  }

  // Show queue statuses
  console.log(`unanalyzed: ${collectiveAction.unanalyzedQueues.length}`);
  console.log(`analyzed: ${collectiveAction.analyzedQueues.length}`);

  // Analyzing URLs with 5 puppeteer pages.
  await collectiveAction.analyzeAll();

  // Show queue statuses
  console.log(`unanalyzed: ${collectiveAction.unanalyzedQueues.length}`);
  console.log(`analyzed: ${collectiveAction.analyzedQueues.length}`);

  // Add some URLs after analyzing...
  for (let i = 0; i < 15; i++) {
    ((start)=>{
      collectiveAction.push(`https://www.google.com/search?q=書籍&num=10&start=${(start * 10)}`);
    })(i);
  }

  // Show queue statuses again..
  console.log(`unanalyzed: ${collectiveAction.unanalyzedQueues.length}`);
  console.log(`analyzed: ${collectiveAction.analyzedQueues.length}`);

  // Analyze all...
  await collectiveAction.analyzeAll();

  // And done !
  console.log(`unanalyzed: ${collectiveAction.unanalyzedQueues.length}`);
  console.log(`analyzed: ${collectiveAction.analyzedQueues.length}`);

  // Show results.
  console.log(collectiveAction.results);

  // Close this collective action
  await collectiveAction.close();
}

!(async () => {
  await init();
})();
```
