/*! BikechainJS (router.js)
	v0.0.1.3 (c) Kyle Simpson
	MIT License
*/

return (function(){

	var publicAPI,
		uri_routing_rules = []
	;

	function checkRules(REQUEST) {
		var i, len, check = true, field, handle, default_field = "RELATIVE_REQUEST_PATH", regex;
		
		for (i=0, len=uri_routing_rules.length; i<len; i++) {
			field = uri_routing_rules[i].which || default_field;
			handle = !(!uri_routing_rules[i].handle);
			regex = new RegExp(uri_routing_rules[i].handle || uri_routing_rules[i].ignore);
			if (typeof REQUEST[field] != "undefined" && regex.test(REQUEST[field])) {
				check = handle;
			}
		}
		
		return check;
	}
	
	function RegisterRoutes(routes_filename) {
		var FS = require("fs"), rules;

		try {
			rules = FS.read(routes_filename);
			if (!rules) throw new Error(""); // trigger error-catch clause since rules is empty
			rules = JSON.parse(JSON.minify(rules)); 
			rules.concat(); 
		}
		catch (err) { return false; }
		
		uri_routing_rules = uri_routing_rules.concat(rules);
		
		return true;
	}
	
	function HandleRequest(REQUEST) {
		if (checkRules(REQUEST)) {
			return true;
		}
		return false;
	}
	
	function RequestPath(REQUEST) {
		return REQUEST.RELATIVE_REQUEST_PATH;
	}
	
	function GetHandleRules(REQUEST) {
		var i, len, field, default_field = "RELATIVE_REQUEST_PATH", regex, rules = [];
		
		for (i=0, len=uri_routing_rules.length; i<len; i++) {
			field = uri_routing_rules[i].which || default_field;
			if (uri_routing_rules[i].handle) {
				regex = new RegExp(uri_routing_rules[i].handle || uri_routing_rules[i].ignore);
				if (typeof REQUEST[field] != "undefined" && regex.test(REQUEST[field])) {
					rules.push(uri_routing_rules[i]);
				}
			}
		}
		return rules;
	}

	publicAPI = {
		RegisterRoutes:RegisterRoutes,
		HandleRequest:HandleRequest,
		RequestPath:RequestPath,
		GetHandleRules:GetHandleRules
	};
	return publicAPI;

})();