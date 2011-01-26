/*! BikechainJS (uri.routing.js)
	v0.0.1.4 (c) Kyle Simpson
	MIT License
*/

(function(global){
	var REQUEST = require("request"),
		RESPONSE = require("response"),
		URI_ROUTER = require("router"),
		STORAGE = require("storage"),
		REQUEST_DATA,
		APP
	;
	
	// temporary output debugging
	global.alert = RESPONSE.Output;

	// import and process REQUEST_DATA 
	REQUEST_DATA = REQUEST.Process();
		
	// register routing tables and check against REQUEST
	if (URI_ROUTER.RegisterRoutes("uri.routing.json")) {
	
		// will application handle the request?
		if (URI_ROUTER.HandleRequest(REQUEST)) {

			// parse Storage cookie data from REQUEST
			STORAGE.Init((REQUEST_DATA.COOKIES && REQUEST_DATA.COOKIES.Storage) ? REQUEST_DATA.COOKIES.Storage : null);

			// load and run the application			
			APP = require("./controllers/app");
			APP.run();
		}
		else {	// otherwise, defer to web server layer for handling
			RESPONSE.Header("X-Location: "+URI_ROUTER.GetRequestPath(REQUEST));
			return;
		}
	}
	else { // route registration failed, so bail
		RESPONSE.Header("Status: 500 Internal Error");
		return;
	}
})(this);