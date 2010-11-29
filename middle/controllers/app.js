// Application UI Controller

return (function(){
	var publicAPI;
	
	function run() {
		var OS = require("os"),
			REQUEST = require("request"),
			RESPONSE = require("response"),
			URI_ROUTER = require("router"), 
			STORAGE = require("storage"),
			__partial__ = REQUEST.IsValueSet("__partial__"),
			REQUEST_DATA = REQUEST.GetData(),
			RESPONSE_DATA,
			handle_rules,
			orig_url,
			pipe
		;
		
		// load/initialize Handlebar templating controller
		include_once("controllers/handlebar/handlebar.js");
		include_once("controllers/handlebar/local-loader.handlebar.js");
		include_once("controllers/handlebar/promise.handlebar.js");
		include_once("controllers/handlebar/util.handlebar.js");
		Handlebar.init("views/templates.json");
				
		// set `Content-type` RESPONSE header for Ajax/JSON or for full HTML page content
		if (__partial__) {
			RESPONSE.Header("Content-type: application/json");
		}
		else {
			RESPONSE.Header("Content-type: text/html");
		}
		
		// special handling for any 'static_state' REQUESTs
		handle_rules = URI_ROUTER.GetHandleRules(REQUEST);
		for (var i=0, len=handle_rules.length; i<len; i++) {
			if (handle_rules[i].static_state) {
				Handlebar.processState(handle_rules[i].static_state,{})
				.then(function(P){
					RESPONSE.Output(P.value);
				});
				exit();
			}
		}

		// validate incoming data
		include_once("controllers/validate.js");
		orig_url = REQUEST.GetValue("orig_url");
		if (typeof orig_url != "undefined") {
			if (!ValidateURL(orig_url)) {
				REQUEST_DATA.__INVALIDATED__ = (REQUEST_DATA.__INVALIDATED__ || []).concat(["orig_url"]);
			}
		}
		
		// make call to backend, send REQUEST_DATA, receive RESPONSE_DATA
		pipe = OS.execute(JSON.stringify(REQUEST_DATA),"/usr/bin/php","../back/app.php"),
		RESPONSE_DATA = pipe.stdout.read();
		if (RESPONSE_DATA) RESPONSE_DATA = JSON.parse(JSON.minify(RESPONSE_DATA));

		// process response data
		if (RESPONSE_DATA) {
			
			// handle session cookie
			RESPONSE.HandleSessionCookie(RESPONSE_DATA);
			
			// format outgoing data
			include_once("controllers/format.js");
			if (RESPONSE_DATA.APP_DATA || RESPONSE_DATA.ERROR_DATA) {
				var data_set = RESPONSE_DATA.APP_DATA || RESPONSE_DATA.ERROR_DATA;
				
				if (typeof data_set["orig_url"] != "undefined") {
					data_set["orig_url"] = FormatURL(data_set["orig_url"]);
				}
				if (typeof data_set["result_set"] != "undefined") {
					for (var i=0, len=data_set["result_set"].length; i<len; i++) {
						data_set["result_set"][i]["orig_url"] = FormatURL(data_set["result_set"][i]["orig_url"]);
					}
				}
			}
			
			// route to various controllers based on app's new APP_STATE
			switch (RESPONSE_DATA.APP_STATE) {
				case "external_redirect":
					var when = new Date();
					when.setDate(when.getDate()+3);
					RESPONSE.Header("Cache-Control: max-age=259200");
					RESPONSE.Header("Expires: "+when.toUTCString());
					RESPONSE.Header("Location: "+RESPONSE_DATA.EXTERNAL_REDIRECT_URL);
					RESPONSE.Header("Status: 301 Moved Permanently");
					RESPONSE.Output("");
					exit();
					break;
				case "index":
				case "shortened_url":
					if (RESPONSE_DATA.APP_STATE == "shortened_url") {
						RESPONSE.Header("Status: 201 Created");
						RESPONSE.Header("Location: http://shortie.me/!"+RESPONSE_DATA.APP_DATA.shortened_url_slug);
					}
					if (__partial__) {
						RESPONSE_DATA.APP_STATE += "_partial";
						RESPONSE.Output(JSON.stringify({"APP_STATE": RESPONSE_DATA.APP_STATE, "APP_DATA": RESPONSE_DATA.APP_DATA}));
					}
					else {
						Handlebar.processState(RESPONSE_DATA.APP_STATE,RESPONSE_DATA.APP_DATA)
						.then(function(P){
							RESPONSE.Output(P.value);
						});
					}
					break;
				case "error":
					if (__partial__) {
						RESPONSE.Output(JSON.stringify({"ERROR":RESPONSE_DATA.ERROR, "ERROR_DATA":RESPONSE_DATA.ERROR_DATA}));
					}
					else {
						Handlebar.processState(RESPONSE_DATA.ERROR,RESPONSE_DATA.ERROR_DATA)
						.then(function(P){
							RESPONSE.Output(P.value);
						});
					}
					break;
				default: // something failed, so return an error
					if (!RESPONSE_DATA.ERROR) RESPONSE_DATA.ERROR = "general_error";
					
					if (__partial__) {
						RESPONSE.Output(JSON.stringify({"ERROR":RESPONSE_DATA.ERROR, "ERROR_DATA":RESPONSE_DATA.ERROR_DATA}));
					}
					else {
						Handlebar.processState(RESPONSE_DATA.ERROR,RESPONSE_DATA.ERROR_DATA)
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