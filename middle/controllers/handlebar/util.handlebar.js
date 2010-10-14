/*! Util.Handlebar.js (Static Utility Functions)
	v0.0.1.1 (c) Kyle Simpson
	MIT License
*/

(function(global){
	var _Util = global.Handlebar.Util || null,
		_TemplateError = global.Handlebar.TemplateError || null,
		_MissingTemplateError = global.Handlebar.MissingTemplateError || null,
		oACTIVEX = global.ActiveXObject
	;
	
	global.Handlebar.Util = {
		cacheBuster:function(src) {
			var rand = Math.round(Math.random()*100000000);
			return  src + ((src.match(/\?.*$/)) ? "&" : "?") + "_" + rand + "=x";
		},
		encodeURIComponent:function(str) {
	  		return encodeURIComponent(str).replace(/!/g,'%21').replace(/'/g,'%27').replace(/\(/g,'%28').replace(/\)/g,'%29').replace(/\*/g,'%2A');
		},
		uriCanonical:function(uri,base){
			if (uri.charAt(0) == "#") uri = base + uri;
			return uri;
		},
		createXHR:function(){
			return (oACTIVEX ? new oACTIVEX("Microsoft.XMLHTTP") : new global.XMLHttpRequest());
		},
		faster_trim:function(str) { // from: http://blog.stevenlevithan.com/archives/faster-trim-javascript
			var str = str.replace(/^\s\s*/, ''),ws = /\s/,i = str.length;
			while (ws.test(str.charAt(--i)));
			return str.slice(0, i + 1);
		},
		cloneObj:function(obj) {
			var clone;
			if (Object.prototype.toString.call(obj) === "[object Array]") {
				clone = [];
				for (var i=0, len=obj.length; i<len; i++) {
					clone[i] = global.Handlebar.Util.cloneObj(obj[i]);
				}
			}
			else if (obj == null) {
				clone = obj;
			}
			else if (typeof obj === "object") {
				clone = {};
				for (var i in obj) {
					if (obj.hasOwnProperty(i)) clone[i] = global.Handlebar.Util.cloneObj(obj[i]);
				}
				// TODO: take care of "shadowed" properties that don't get iterated in a for-in
				// var dontEnumProperties = ['constructor', 'hasOwnkey', 'isPrototypeOf',
				// 'propertyIsEnumerable', 'prototype', 'toLocaleString', 'toString', 'valueOf'];
			}
			else {
				clone = obj;
			}
			return clone;
		},
		noConflict:function() {
			var _u = global.Handlebar.Util;
			global.Handlebar.Util = _Util;
			return _u;
		}
	}

	global.Handlebar.TemplateError = (function() {
		function F(){}
		function CustomError() {
			var _this = (this===global) ? new F() : this, // correct if not called with "new" 
				tmp = Error.prototype.constructor.apply(_this,arguments)
			;
			for (var i in tmp) {
				if (tmp.hasOwnProperty(i)) _this[i] = tmp[i];
			}
			return _this;
		}
		function SubClass(){}
		SubClass.prototype = Error.prototype;
		F.prototype = CustomError.prototype = new SubClass();
		CustomError.prototype.constructor = CustomError;
		
		CustomError.prototype.TemplateName = function(tname) {
			if (tname != null) this.template_name = tname;
			return this.template_name;
		}
		
		CustomError.prototype.TemplateTag = function(ttag) {
			if (ttag != null) this.template_tag = ttag;
			return this.template_tag;
		}
		
		CustomError.prototype.Value = function(tval) {
			if (tval != null) this.value = tval;
			return this.value;
		}
		
		CustomError.prototype.toString = function() {
			return "TemplateError: "+this.message+(this.template_name!=null?"\nTemplate: "+this.template_name:"")+(this.template_tag!=null?"\nExpression: "+this.template_tag:"")+(this.value!=null?"\nValue: "+this.value:"");
		}
		
		return CustomError;
	})();
	global.Handlebar.TemplateError.noConflict = function(){
		var _te = global.Handlebar.TemplateError;
		global.Handlebar.TemplateError = _TemplateError;
		return _te;
	};
	
	global.Handlebar.MissingTemplateError = (function() {
		function F(){}
		function CustomError() {
			var _this = (this===global) ? new F() : this, // correct if not called with "new" 
				tmp = global.Handlebar.TemplateError.prototype.constructor.apply(_this,arguments)
			;
			for (var i in tmp) {
				if (tmp.hasOwnProperty(i)) _this[i] = tmp[i];
			}
			return _this;
		}
		function SubClass(){}
		SubClass.prototype = global.Handlebar.TemplateError.prototype;
		F.prototype = CustomError.prototype = new SubClass();
		CustomError.prototype.constructor = CustomError;
		
		CustomError.prototype.toString = function() {
			return "MissingTemplateError: "+this.message+(this.template_name!=null?"\nTemplate: "+this.template_name:"")+(this.template_tag!=null?"\nExpression: "+this.template_tag:"")+(this.value!=null?"\nValue: "+this.value:"");
		}
		
		return CustomError;
	})();
	global.Handlebar.MissingTemplateError.noConflict = function(){
		var _mte = global.Handlebar.MissingTemplateError;
		global.Handlebar.MissingTemplateError = _MissingTemplateError;
		return _mte;
	};

})(this);

/*!
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html
*/
if(!this.JSON){this.JSON={}}(function(){function l(c){return c<10?'0'+c:c}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(c){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+l(this.getUTCMonth()+1)+'-'+l(this.getUTCDate())+'T'+l(this.getUTCHours())+':'+l(this.getUTCMinutes())+':'+l(this.getUTCSeconds())+'Z':null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(c){return this.valueOf()}}var o=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,p=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,h,m,r={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},j;function q(a){p.lastIndex=0;return p.test(a)?'"'+a.replace(p,function(c){var f=r[c];return typeof f==='string'?f:'\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function n(c,f){var a,e,d,i,k=h,g,b=f[c];if(b&&typeof b==='object'&&typeof b.toJSON==='function'){b=b.toJSON(c)}if(typeof j==='function'){b=j.call(f,c,b)}switch(typeof b){case'string':return q(b);case'number':return isFinite(b)?String(b):'null';case'boolean':case'null':return String(b);case'object':if(!b){return'null'}h+=m;g=[];if(Object.prototype.toString.apply(b)==='[object Array]'){i=b.length;for(a=0;a<i;a+=1){g[a]=n(a,b)||'null'}d=g.length===0?'[]':h?'[\n'+h+g.join(',\n'+h)+'\n'+k+']':'['+g.join(',')+']';h=k;return d}if(j&&typeof j==='object'){i=j.length;for(a=0;a<i;a+=1){e=j[a];if(typeof e==='string'){d=n(e,b);if(d){g.push(q(e)+(h?': ':':')+d)}}}}else{for(e in b){if(Object.hasOwnProperty.call(b,e)){d=n(e,b);if(d){g.push(q(e)+(h?': ':':')+d)}}}}d=g.length===0?'{}':h?'{\n'+h+g.join(',\n'+h)+'\n'+k+'}':'{'+g.join(',')+'}';h=k;return d}}if(typeof JSON.stringify!=='function'){JSON.stringify=function(c,f,a){var e;h='';m='';if(typeof a==='number'){for(e=0;e<a;e+=1){m+=' '}}else if(typeof a==='string'){m=a}j=f;if(f&&typeof f!=='function'&&(typeof f!=='object'||typeof f.length!=='number')){throw new Error('JSON.stringify');}return n('',{'':c})}}if(typeof JSON.parse!=='function'){JSON.parse=function(i,k){var g;function b(c,f){var a,e,d=c[f];if(d&&typeof d==='object'){for(a in d){if(Object.hasOwnProperty.call(d,a)){e=b(d,a);if(e!==undefined){d[a]=e}else{delete d[a]}}}}return k.call(c,f,d)}o.lastIndex=0;if(o.test(i)){i=i.replace(o,function(c){return'\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(i.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){g=eval('('+i+')');return typeof k==='function'?b({'':g},''):g}throw new SyntaxError('JSON.parse');}}}());