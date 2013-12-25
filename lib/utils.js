//
// https://gist.github.com/clarkbw/4999903
//
const { Cc, Ci } = require('chrome');
const { when: unload } = require('sdk/system/unload');

var ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);

/* Helper that registers style sheets and remembers to unregister on unload */
exports.addXULStylesheet = function addXULStylesheet(url) {
  var uri = newURI(url);
  var sss = Cc["@mozilla.org/content/style-sheet-service;1"]
                  .getService(Ci.nsIStyleSheetService);
  sss.loadAndRegisterSheet(uri, sss.USER_SHEET);

  unload(function () {
    if (sss.sheetRegistered(uri, sss.USER_SHEET)) {
      sss.unregisterSheet(uri, sss.USER_SHEET);
    }
  });
};

function newURI(uriStr, base) {
  try {
    var baseURI = base ? ios.newURI(base, null, null) : null;
    return ios.newURI(uriStr, null, baseURI);
  }
  catch (e) {
    if (e.result === chrome.Cr.NS_ERROR_MALFORMED_URI) {
      throw new Error("malformed URI: " + uriStr);
    } else if (e.result === chrome.Cr.NS_ERROR_FAILURE ||
               e.result === chrome.Cr.NS_ERROR_ILLEGAL_VALUE) {
      throw new Error("invalid URI: " + uriStr);  
    }
  }
  return null;
}
