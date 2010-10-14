var submit_in_progress = false;

function updateResults(data) {
	$("#indicator").hide();
	if (typeof data == "string") data = JSON.parse(data);
	
	if (data.ERROR) {
		alert("There was an error processing the request. Please try again.");
	}
	else if (data.APP_STATE) {
		$("#indicator").show();
		Handlebar.processState(data.APP_STATE,data.APP_DATA)
		.then(function(P){
			$("#indicator").hide();
			$("#do_shorten").removeAttr("disabled");
			$("#results").html(P.value);
			submit_in_progress = false;
		});
	}
}

function init() {	
	$("#indicator").ajaxStart(function(){
		$(this).show();
	})
	
	$("#enter_url").bind("submit",function(evt){
		if (!submit_in_progress) {
			submit_in_progress = true;
			var orig_url = $("#orig_url").val();
			
			$("#do_shorten").attr("disabled","true");
			
			if (ValidateURL(orig_url)) {
				$.post("/shortenurl",{
						"__partial__":true, // tells the app we only want the data to return, not the full html page
						"orig_url": orig_url
					},
					updateResults
				);
			}
			else {
				alert("Not valid: "+FormatURL(orig_url)+"\nURL must be of the form: http://domain.tld/path and be 1000 characters or less.");
			}
		}

		evt.preventDefault();
		return false;
	});
}