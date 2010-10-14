(function(global){

	global.FormatURL = function(url) {
		return url.replace(/</g,"&lt;").replace(/"/g,"&quot;");
	};  
		  
})(this);