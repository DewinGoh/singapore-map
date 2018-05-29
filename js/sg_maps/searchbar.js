

function activateSearchbar() {
	$("#searchbar").addClass("active");
}

function loadSearchbar(placeholder,bigscreen) {
	$("#searchbar-input").attr("placeholder", placeholder);

	if (! bigscreen) {
		$("#searchbar").addClass("active");
		if ($("#sidebar").hasClass("active")) {
			return false
		}
	}
	
	$("#searchbar").show();
}

function hideSearchbar(deactivate) {
	if (deactivate) {
		$("#searchbar").removeClass("active");
		$("#searchbar-input").attr("placeholder", "");
	}
	$('#searchbar').hide();
}

function throwSearchError(errmsg) {
	// REDBOX OF DOOM
	$("#errorbox").html(errmsg);
	$("#errorbox").show();

}

function getLocation(input,passFunc,failFunc) {
	$.ajax({
	  type: 'GET',
	  url: 'https://developers.onemap.sg/commonapi/search',
	  data: {'searchVal':input,
			'returnGeom':'Y',
			'getAddrDetails':'Y',
			'pageNum':1},
	  cache: false,
	  success: function(data){
	  	// do something!

	  	var results = data["results"]
	  	if (results.length > 0) {
	  		passFunc([results[0]["LATITUDE"],results[0]["LONGITUDE"]],
	  				results[0]["ADDRESS"]);

	  	} else {
	  		throwSearchError("Unable to find location of: <br>"+input);
	  		// RED BOX OF WARNING
	  	}
	  	// reset input val
	}
	});
}