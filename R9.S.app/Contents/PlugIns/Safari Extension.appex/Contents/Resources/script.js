function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}

var uuid = guid();


function fillLogin(message) {
	var pageIdentifier = message["identifier"]
	if (pageIdentifier === uuid) {
		var username = message["username"]
		var password = message["password"]
		var autosubmit = message["autosubmit"]
		sbx_ns.fillLogin(username, password, autosubmit)
	}
}

function updatePageMetadata() {
	var identifier = uuid
	var sourceURL = document.location.href
	var canFill = sbx_ns.canFillLogin()
	
	if (typeof(identifier) != 'string' ||
        typeof(sourceURL) != 'string' ||
        typeof(canFill) != 'boolean') { return; }
	
	safari.extension.dispatchMessage("RecordPageMetadata", {
		"identifier": identifier,
		"sourceURL": sourceURL,
		"canFill": canFill,
	});
}

var fiveSharpTimer = null;
function clearFiveSharpTimer() {
	
	if (fiveSharpTimer != null) {
		clearTimeout(fiveSharpTimer);
		fiveSharpTimer = null;
	} 
}

function everyFiveSharp(cb) {
    (function loop() {
        var now = new Date();
        if (now.getMinutes() % 5 == 0) {
            cb();
        }
        now = new Date();                  // allow for time passing
        var delay = 60000 - (now % 60000); // exact ms to next minute interval
		clearFiveSharpTimer()
        fiveSharpTimer = setTimeout(loop, delay);
    })();
}


function handleMessage(event) {
	if (event.name === "FillLogin") {
		fillLogin(event.message);
	}
}

safari.self.addEventListener("message", handleMessage);
document.addEventListener("DOMContentLoaded", function(event) {
	console.log("dom loaded")
	updatePageMetadata();
	everyFiveSharp(updatePageMetadata);
});


// document.addEventListener("DOMNodeInserted", function(event) {
// 	updatePageMetadata();
// });
// document.addEventListener("DOMNodeRemoved", function(event) {
// 	updatePageMetadata();
// });

window.onfocus = function(event) {
	var identifier = uuid
	if (typeof(identifier) != 'string') { return; }
	
	safari.extension.dispatchMessage("CheckForLogins", {
		"identifier": identifier,
	});
	
	updatePageMetadata();
};


function pageShown(evt) {
	updatePageMetadata();
	everyFiveSharp(updatePageMetadata);
}

function pageHidden(evt){
	clearFiveSharpTimer();
}

window.addEventListener("pageshow", pageShown, false);
window.addEventListener("pagehide", pageHidden, false); 