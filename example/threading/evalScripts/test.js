
module.exports = function() {
  let ret = {};
  let resultLinks = document.querySelectorAll("a.result__a");

  ret.length = resultLinks.length;
  ret.contents = [];

  for (let i = 0; i < ret.length; i++) {
    ret.contents.push({
      title: resultLinks[i].innerText,
      url: resultLinks[i].href,
    });
  }

  return ret;
}
