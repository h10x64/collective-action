const {Worker} = require("worker_threads");

// Create CollectiveActionThread //

const worker = new Worker("./thread/CollectiveActionThread.js", {
  workerData: {
    evaluateScriptFiles: [
      {name: "scr01", path: "../evalScripts/test"},
    ],
    concurrentPageNumber: 3,
  },
});


// Settings //

const TARGET_URLS = [
  "https://duckduckgo.com/?q=hoge",
  "https://duckduckgo.com/?q=hogehoge",
  "https://duckduckgo.com/?q=hogehogehoge",
  "https://duckduckgo.com/?q=fuga",
  "https://duckduckgo.com/?q=fugafuga",
  "https://duckduckgo.com/?q=fugafugafuga",
  "https://duckduckgo.com/?q=fugafugafugafuga",
];


// Event Methods //

///
// BASIC USAGE
///
// 1. postMessage({type:"INIT"}) -> {type: "INIT", status:"SUCCEEDED"}
// 2. postMessage({type:"PUSH", body: {url: "https://example.com/hogehoge"}}) -> {type: "PUSH", status:"SUCCEEDED"}
//    (repeat ^ )
// 3. postMessage({type: "RUN"}) -> {type:"RUN", status"SUCCEEDED"}
// 4.   -> {type: "ANALYZED", body: any} when worker analyse some URL.
// 5.   -> {type: "ALL_ANALYZED_COMPLETED", body: any} when worker analysed all URLs.
///

function onInit(evt) {
  console.log("onInit");

  // Push all URLs under the worker
  for (let i in TARGET_URLS) {
    const URL = TARGET_URLS[i];

    worker.postMessage({
      type: "PUSH",
      body: {
        url: URL,
      },
    });
  }

  // Run the worker
  worker.postMessage({
    type: "RUN",
    body: {}
  });
}

function onGetInfo(evt) {
  console.log("onGetInfo");
  console.log(evt);
}

function onPushed(evt) {
  console.log("onPushed");
  console.log(evt);
}

function onCancelled(evt) {
  console.log("onCancelled");
  console.log(evt);
}

function onRunned(evt) {
  console.log("onRunned");
  console.log(evt);
}

function onInterrupted(evt) {
  console.log("onInterrupted");
  console.log(evt);
}

function onResumed(evt) {
  console.log("onResumed");
  console.log(evt);
}

function onAbortted(evt) {
  console.log("onAbortted");
  console.log(evt);
}

function onClosed(evt) {
  console.log("onClosed");
  console.log(evt);

  // Terminate Thread
  console.log("Terminate Worker.")
  worker.terminate();

  // Exit
  console.log("BYE.")
  process.exit();
}

function onAnalyzed(evt) {
  console.log("onAnalyzed");
  console.log(evt);

  let res = evt.body.scr01;
  console.log(res.contents);
}

function onAllAnalyzeCompleted(evt) {
  console.log("onAllAnalyzeCompleted");

  const res = evt.body;
  const contents = []
  for (let i in res) {
    let scr01_ret = res[i].result.scr01;
    for (let j in scr01_ret.contents) {
      contents.push(scr01_ret.contents[j]);
    }
  }

  console.log(contents);

  // Close Puppeteer Browser
  worker.postMessage({
    type: "CLOSE",
    body: {},
  });
}


// Event Listener //

function onMessage(evt) {
  if (evt.status == "FAILED") {
    console.error(evt);
    return;
  }

  switch (evt.type) {
    case "INIT": {
      onInit(evt);
      break;
    }
    case "GET_INFO": {
      onGetInfo(evt);
      break;
    }
    case "PUSH": {
      onPushed(evt);
      break;
    }
    case "CANCEL": {
      onCancelled(evt);
      break;
    }
    case "RUN": {
      onRunned(evt);
      break;
    }
    case "INTERRUPT": {
      onInterrupted(evt);
      break;
    }
    case "RESUME": {
      onResumed(evt);
      break;
    }
    case "ABORT": {
      onAbortted(evt);
      break;
    }
    case "CLOSE": {
      onClosed(evt);
      break;
    }
    case "ANALYZED": {
      onAnalyzed(evt);
      break;
    }
    case "ALL_ANALYZE_COMPLETED": {
      onAllAnalyzeCompleted(evt);
      break;
    }
    default: {
      console.warn("UNKNOWN_EVENT_OCCURED", evt);
      break;
    }
  }
};

function onError(evt) {
  console.log(evt);
};


// Main //

// addEventListeners
worker.addListener("message", onMessage);
worker.addListener("error", onError);

// Initialize worker
worker.postMessage({type: "INIT", body: {}});
