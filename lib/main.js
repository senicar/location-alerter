var {Cc, Ci, Cu, Cm, components} = require("chrome");

let { addXULStylesheet } = require('utils.js');

var settings = require('sdk/simple-prefs');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var utils = require('sdk/window/utils');

var strings = settings.prefs['strings'].split(',');
var bgcolor = settings.prefs['bgcolor'];

const STYLE_URI = require('sdk/self').data.url("location-alerter.css");

addXULStylesheet(STYLE_URI);

// Listen for tab activation.
tabs.on('activate', function onOpen(tab) {
	console.log('tab is active', tab.title, tab.url)
	checkUrl(tab.url);
});

// Listen for tab openings.
tabs.on('open', function onOpen(tab) {
	console.log('tab is opened', tab.title, tab.url)
	checkUrl(tab.url);
});
 
// Listen for tab content loads.
tabs.on('ready', function(tab) {
	console.log('tab is loaded', tab.title, tab.url)
	checkUrl(tab.url);
});

function onPrefChange(prefName) {
    console.log("The " + prefName + " preference changed.");

	strings = settings.prefs['strings'].split(',');
	bgcolor = settings.prefs['bgcolor'];

	console.log(bgcolor);
	console.log(strings);

	checkUrl(tabs.activeTab.url);
}

require("sdk/simple-prefs").on("bgcolor", onPrefChange);
require("sdk/simple-prefs").on("strings", onPrefChange);


var checkUrl = function (url) {

	let aWindow = utils.getMostRecentBrowserWindow();
	let urlbar_container = aWindow.document.getElementById('urlbar-container');
	let urlbar = aWindow.document.getElementById('urlbar');
	let urlbar_display_box = aWindow.document.getElementById('urlbar-display-box');
	let urlbar_textbox_container = aWindow.document.getAnonymousNodes(urlbar)[0];
	let urlbar_input_box = urlbar_textbox_container.childNodes[1];

	console.log(urlbar_textbox_container);
	console.log(urlbar_input_box);

	urlbar.classList.remove('alert-bad');

	// light or dark highlight
	var c = bgcolor.substring(1);      // strip #
	var rgb = parseInt(c, 16);   // convert rrggbb to decimal
	var r = (rgb >> 16) & 0xff;  // extract red
	var g = (rgb >>  8) & 0xff;  // extract green
	var b = (rgb >>  0) & 0xff;  // extract blue

	var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

	let text_color = '#efefef';
	console.log(luma);
	if (luma > 135)
		text_color = '#212121';

	urlbar.classList.remove('alert-bad');
	urlbar_input_box.style.backgroundColor = 'inherit';
	urlbar_input_box.style.color = 'inherit';

	if(tabs.activeTab.url == url) {
		strings.forEach(function(string) {
			//let trimmed = string.trim();

			if(url.search(string) >= 0 && string.length > 0) {
				urlbar.classList.add('alert-bad');
				urlbar_input_box.style.backgroundColor = bgcolor;
				urlbar_input_box.style.color = text_color;
			}
		});
	}

	console.log(urlbar.classList.contains('alert-bad'));
}

exports.onUnload = function(reason) {
	let aWindow = utils.getMostRecentBrowserWindow();
	let urlbar = aWindow.document.getElementById('urlbar');
	let urlbar_textbox_container = aWindow.document.getAnonymousNodes(urlbar)[0];
	let urlbar_input_box = urlbar_textbox_container.childNodes[1];

	urlbar.classList.remove('alert-bad');
	urlbar_input_box.style.backgroundColor = 'inherit';
	urlbar_input_box.style.color = 'inherit';
};
