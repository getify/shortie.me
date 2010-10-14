/*! BikechainJS (uri.routing.js)
	v0.0.1.3 (c) Kyle Simpson
	MIT License
*/

(function(global){
	var system = require("system"),
		REQUEST_HANDLER = require("request"),
		RESPONSE = require("response"),
		URI_ROUTER = require("router"),
		REQUEST,
		APP
	;
	
	// temporary output debugging
	global.alert = global.console.log = global.console.warn = global.console.error = RESPONSE.Output;

	// import the REQUEST environment from the web server layer
	try {
		REQUEST = system.stdin.read(false);
		if (!REQUEST) throw new Error(""); // trigger error-catch clause since REQUEST is empty
		REQUEST = JSON.parse(REQUEST);
	}
	catch (err) {
		RESPONSE.Header("Status: 500 Internal Error");
		exit();
	}

	// parse/process REQUEST data
	REQUEST = REQUEST_HANDLER.parse(REQUEST);
	
	// register routing tables and check against REQUEST
	if (URI_ROUTER.RegisterRoutes("uri.routing.json")) {
	
		// will application handle the request?
		if (URI_ROUTER.HandleRequest(REQUEST)) {
			APP = require("./controllers/app");
			APP.run(REQUEST,RESPONSE,URI_ROUTER);
		}
		else {	// otherwise, defer to web server layer for handling
			// make all file requests relative to the `/front/` sub-directory
			RESPONSE.Header("X-Location: ../front"+URI_ROUTER.RequestPath());
			exit();
		}
	}
	else { // route registration failed, so must bail
		RESPONSE.Header("Status: 500 Internal Error");
		exit();
	}
})(this);