(function(global){

	global.ValidateURL = function(url) {
		if (!url.match(/^https?:\/\/[a-z0-9]{3,}/i)) return false;
		else if (url.length > 1000) return false;
		return true;
	};  
		  
})(this);