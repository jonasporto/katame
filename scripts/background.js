chrome.browserAction.onClicked.addListener(function(tab) {
	_executeScript([
	  'scripts/utils.js',
	  'scripts/functions.js',
	  'scripts/components.js',
	  'scripts/template.js',
	  'scripts/main.js'
	]);
});

function _executeScript(paths) {
  if (paths.constructor === Array) {
    return paths.forEach(_executeScript)
  }

  chrome.tabs.executeScript({
  	file: paths
  });
}