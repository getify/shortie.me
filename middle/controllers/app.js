// Application UI Controller

return (function(){
	var publicAPI;
	
	function run(REQUEST,RESPONSE,URI_ROUTER) {
		
		if (URI_ROUTER.RequestPath().match(/^\/(controllers|views|bikechain\/misc)\/.+/i)) {
			RESPONSE.Header("X-Location: "+URI_ROUTER.RequestPath());
			exit();
		}
		
		var OS = require("os"),
			REQUEST_HANDLER = require("request"),
			pipe,
			resp_data,
			__partial__ = REQUEST_HANDLER.exists(REQUEST,"__partial__")
		;
		
		// parse session cookie data from REQUEST
		if (REQUEST.COOKIES && REQUEST.COOKIES.SessionCookie) {
			var parts = REQUEST.COOKIES.SessionCookie.split("|");
			REQUEST.SESSION_NAME = parts[0];
			if (parts[1]) REQUEST.SESSION_ID = parts[1];
		}
		
		// set `Content-type` RESPONSE header for Ajax/JSON or for full HTML page content
		if (__partial__) {
			RESPONSE.Header("Content-type: application/json");
		}
		else {
			RESPONSE.Header("Content-type: text/html");
		}

		// validate incoming data
		include_once("controllers/validate.js");
		var orig_url = REQUEST_HANDLER.value(REQUEST,"orig_url");
		if (typeof orig_url != "undefined") {
			if (!ValidateURL(orig_url)) {
				REQUEST.INVALIDATED = (REQUEST.INVALIDATED || []).concat(["orig_url"]);
			}
		}
		
		// make call to backend, send REQUEST, receive response data
		pipe = OS.execute(JSON.stringify(REQUEST),"/usr/bin/php","../back/app.php"),
		resp_data = pipe.stdout.read();
		if (resp_data) resp_data = JSON.parse(JSON.minify(resp_data));

		// process response data
		if (resp_data) {
			
			// format outgoing data
			include_once("controllers/format.js");
			if (resp_data.APP_DATA || resp_data.ERROR_DATA) {
				var orig_url = (resp_data.APP_DATA) ? resp_data.APP_DATA["orig_url"] : resp_data.ERROR_DATA["orig_url"];
				
				if (resp_data.APP_DATA && typeof resp_data.APP_DATA["orig_url"] != "undefined") {
					resp_data.APP_DATA["orig_url"] = FormatURL(resp_data.APP_DATA["orig_url"]);
				}
				else if (resp_data.ERROR_DATA && typeof resp_data.ERROR_DATA["orig_url"] != "undefined") {
					resp_data.ERROR_DATA["orig_url"] = FormatURL(resp_data.ERROR_DATA["orig_url"]);
				}
			}
			
			// handle session cookie
			if (resp_data.SESSION_NAME && resp_data.SESSION_ID && (resp_data.SESSION_FORCE || !(REQUEST.COOKIES && REQUEST.COOKIES.SessionCookie))) {
				RESPONSE.SessionCookie(resp_data.SESSION_NAME,resp_data.SESSION_ID,REQUEST.HTTP_HOST,"/");	
			}

			// initialize Handlebar templating controller
			include_once("controllers/handlebar/handlebar.js");
			include_once("controllers/handlebar/local-loader.handlebar.js");
			include_once("controllers/handlebar/promise.handlebar.js");
			include_once("controllers/handlebar/util.handlebar.js");
			Handlebar.init("views/templates.json");
			
			// route to various controllers based on app's new APP_STATE
			switch (resp_data.APP_STATE) {
				case "external_redirect":
					RESPONSE.Header("Location: "+resp_data.EXTERNAL_REDIRECT_URL);
					RESPONSE.Header("Status: 301 Moved Permanently");
					RESPONSE.Output("");
					exit();
					break;
				case "index":
				case "shortened_url":
					if (__partial__) {
						resp_data.APP_STATE += "_partial";
						RESPONSE.Output(JSON.stringify({"APP_STATE": resp_data.APP_STATE, "APP_DATA": resp_data.APP_DATA}));
					}
					else {
						Handlebar.processState(resp_data.APP_STATE,resp_data.APP_DATA)
						.then(function(P){
							RESPONSE.Output(P.value);
						});
					}
					break;
				case "error":
					if (__partial__) {
						RESPONSE.Output(JSON.stringify({"ERROR":resp_data.ERROR, "ERROR_DATA":resp_data.ERROR_DATA}));
					}
					else {
						Handlebar.processState(resp_data.ERROR,resp_data.ERROR_DATA)
						.then(function(P){
							RESPONSE.Output(P.value);
						});
					}
					break;
				default: // something screwed up, so display an error (page)
					if (!resp_data.ERROR) resp_data.ERROR = "general_error";
					
					if (__partial__) {
						RESPONSE.Output(JSON.stringify({"ERROR":resp_data.ERROR, "ERROR_DATA":resp_data.ERROR_DATA}));
					}
					else {
						Handlebar.processState(resp_data.ERROR,resp_data.ERROR_DATA)
						.then(function(P){
							RESPONSE.Output(P.value);
						});
					}
			}
		}
		else {
			RESPONSE.Header("Status: 500 Internal Error");
		}
	}
	
	publicAPI = {
		run:run
	};	
	return publicAPI;
})();