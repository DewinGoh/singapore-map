
$("#rt_taxi_pos").click(function(){
	clearGlobals();
	showLoadingScreen();
	getTaxiAvailability();
	timeoutID = setInterval(getTaxiAvailability,30*1000);
});

$("#rt_carpark_availability").click(function(){
	clearGlobals();
	showLoadingScreen();
	getCarparkAvailability();
	timeoutID = setInterval(getCarparkAvailability,60*1000);
});

$("#station_locations").click(function(){
	clearGlobals();
	showLoadingScreen();
	getWeatherStations();
	timeoutID = setInterval(getWeatherStations,60*1000);
	replaceHeaderText("Weather Station Locations");
});


$("#rt_weather").click(function(){
	clearGlobals();
	showLoadingScreen();
	getRainfall();
	timeoutID = setInterval(getRainfall,60*1000);
});

$("#clear-viz").click(function(){
	clearGlobals();
	clearMap(mymap);
	this.blur();
	replaceHeaderText(initHeaderText);
});


 $('#sidebarCollapse').click(function() {
     $('#sidebar').toggleClass('active');
     if ($("#searchbar").hasClass("active")){
     	if ($('#sidebar').hasClass('active')) {
     		hideSearchbar();
     	} else {
     		loadSearchbar($("#searchbar-input").attr("placeholder"));
     	}
     } 
     $('#navbar-icon').toggleClass('glyphicon-chevron-left');
 });


$("#searchbar-form").submit(function(e){
	e.preventDefault();
	var searchTerm = $("#searchbar-input").val();
	if ((searchTerm.length<2 )| (searchTerm.length > 40)) {
		console.log(searchTerm);
		// put a red transparent box to warn
	} else {
		getLocation(searchTerm,getLocationPin);
		$("#searchbar-input").val("");
		// update map!
	}	
});

