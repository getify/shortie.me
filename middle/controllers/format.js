/*!	Shortie.me URL Shortener (format.js)
	(c) Kyle Simpson
	MIT License
*/

(function(global){

	global.FormatURL = function(url) {
		return url.replace(/</g,"&lt;").replace(/"/g,"&quot;");
	};  
		  
})(this);