
// one and only singapore map
var sg_coords = [1.3521,103.8198]
var mymap = L.map('map-container').setView(sg_coords, 11);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    minZoom: 10,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicGxzZ3JhYiIsImEiOiJjamZ6Y2w4OHkweWF0MnFtbmR3Mmh2bTJxIn0.OpkABjTzNDKiK_1ab7JTpQ'
}).addTo(mymap);

function clearMap(m) {
	if (m == null) {
		console.log("OK NOTHING TO CLEAR");
	}
	else {
		// for(i in m._layers) {
		//     if(m._layers[i]._path != undefined) {
		//         try {
		//             m.removeLayer(m._layers[i]);
		//         }
		//         catch(e) {
		//             console.log("problem with " + e + m._layers[i]);
		//         }
		//     }
		// }
		mymap.removeLayer(overlay);
	}
}

var overlay; // can change this to a list in the future, to allow multiple overlays to be added at the same time
var timeoutID;
var legend;
const rainfallColorMap = ['#FEEA06','#BEB83D','#7F8675','#3F54AD','#0022E5'] // blue to grey to yellow
const rainfallValues = [0,0.2,0.4,0.6,0.8]
const availabilityColorMap = ['#ff0000','#ffa500','#ffff00','#9acd32','#00ff00'] // green to yellow to red
const availabilityValues = [0,0.2,0.4,0.6,0.8]

function colorMapWeather(value) {
	for (j=1;j<rainfallValues.length;j++) {
		if (value<=rainfallValues[j]){
			return rainfallColorMap[j-1]
		}
	}
	return rainfallColorMap[rainfallColorMap.length-1]
}

function colorCarparkAvailability(value) {
	for (j=1;j<availabilityValues.length;j++) {
		if (value<=availabilityValues[j]){
			return availabilityColorMap[j-1]
		}
	}
	return availabilityColorMap[availabilityColorMap.length-1]
}

function clearGlobals() {
	if (timeoutID == null){} else {
		clearInterval(timeoutID);
	}

	if (legend == null){} else {
        mymap.removeControl(legend);
	}
}

function getWeatherStations() {
	$.ajax({
	  type: 'GET',
	  url: 'https://api.data.gov.sg/v1/environment/rainfall',
	  cache: false,
	  success: function(data){
		clearMap(overlay);	
		var locs = data.metadata["stations"]
		var markerData = []
		for (i=0;i<locs.length;i++) {
			var lat = locs[i]["location"]["latitude"]
			var lng = locs[i]["location"]["longitude"]
			var popup = locs[i]["name"]
			markerData.push(L.marker([lat,lng]).bindPopup(popup));
		}
		overlay = L.layerGroup(markerData).addTo(mymap);
	}
	});
}

function getRainfall() {
	$.ajax({
	  type: 'GET',
	  url: 'https://api.data.gov.sg/v1/environment/rainfall',
	  cache: false,
	  success: function(data){
		clearMap(overlay);
		var locs = data.metadata["stations"]
		var allweather = data.items[0].readings
		var weatherData = []
		var color;
		for (i=0;i<locs.length;i++) {
			stn = locs[i]["id"]
			stn_name = locs[i]["name"]
			stn_loc = [locs[i]["location"]["latitude"],locs[i]["location"]["longitude"]]
			weather_stn = allweather[i]["station_id"]
			weather_val = allweather[i]["value"]
			color = colorMapWeather(weather_val);
			weatherData.push(
			L.circle(stn_loc,{
				color: color,
			    fillColor: color,
			    fillOpacity: 0.7,
			    radius: 500
			}));
		}
		overlay = L.layerGroup(weatherData).addTo(mymap);
	}
	
	});
}

function createLegend(color_bins,bin_values,title){

    legend = L.control({position: 'topright'});

    legend.onAdd = function (mymap) {

	    var div = L.DomUtil.create('div', 'info legend')

	    div.innerHTML += '<p align="center"><b><u>' + title + '</u></b><br></p>'

	    // loop through our density intervals and generate a label with a colored square for each interval
	    for (var i=0;i<color_bins.length;i++) {
	        if (i == color_bins.length-1){
	            div.innerHTML +=
	            '<i style="background:' + color_bins[i] + '"></i> ' +
	            '>' + (bin_values[i]);

	        } else {
	                div.innerHTML +=
	                '<i style="background:' + color_bins[i] + '"></i> ' + (bin_values[i]) + '&ndash;'+ bin_values[i+1] + '<br>';
	            }
	        }

	        return div;
	    };

    legend.addTo(mymap);
}

function getCarparkLocations(){
	var data = {
	  resource_id: '139a3035-e624-4f56-b63f-89ae28d4ae4c' // the resource id
	};
	$.ajax({
	  url: "https://data.gov.sg/api/action/datastore_search",
	  // url: 'https://api.da.gov.sg/v1/transport/carpark-availability',
  	  data: data,
	  success: function(data){
		clearMap(overlay);	
		var carparks = data["result"]["records"]
		var carparkData = []
		var carparkPos = JSON.parse(carparkPosData);
		var carparkNo,lat,lng,popup;
		for (i=0;i<carparks.length;i++) {
			carparkNo = carparks[i]["car_park_no"]
			lat = carparkPos[carparkNo]["lat"]
			lng = carparkPos[carparkNo]["lng"]
			popup = '<b>'+carparkPos[carparkNo]["address"]+'</b><br><br>'+carparkPos[carparkNo]["car_park_type"]
			carparkData.push(L.marker([lat,lng]).bindPopup(popup));
		}
		overlay = L.layerGroup(carparkData).addTo(mymap);
	}
	});
}

function getCarparkAvailability(){
	$.ajax({
	  type: 'GET',
	  cache: true,
	  url: 'https://api.data.gov.sg/v1/transport/carpark-availability',
	  success: function(data){
		clearMap(overlay);	
		var carparks = data["items"][0]["carpark_data"]
		var carparkData = []
		var carparkPos = JSON.parse(carparkPosData);
		var carparkNo,carparkInfo,popup,carparkCoords,lot_ratio;		
		for (i=0;i<carparks.length;i++) {
			// get coords
			carparkNo = carparks[i]["carpark_number"]
			try {
				carparkCoords = [carparkPos[carparkNo]["lat"],carparkPos[carparkNo]["lng"]]
			} 
			catch(err){
				continue
			}
			// get popup info
			carparkInfo = carparks[i]["carpark_info"]
			lots_available = carparkInfo[0]["lots_available"]
			total_lots = carparkInfo[0]["total_lots"]
			popup = '<b>'+carparkPos[carparkNo]["address"]+'</b><br><br>Lots Available: '+lots_available+'<br>Total Lots: '+total_lots

			lot_ratio = lots_available/total_lots
			color = colorCarparkAvailability(lot_ratio);
			carparkData.push(
			L.circle(carparkCoords,{
				color: color,
			    fillColor: color,
			    fillOpacity: 0.7,
			    radius: 100
			}).bindPopup(popup));
		}
		overlay = L.layerGroup(carparkData).addTo(mymap);
	}
	});
}


$("#rt_carpark_availability").click(function(){
	clearGlobals();
	getCarparkAvailability();
	createLegend(availabilityColorMap,availabilityValues,"Carpark Occupancy");
	timeoutID = setInterval(getCarparkAvailability,60*1000);
});

$("#carpark_locations").click(function(){
	clearGlobals();
	getCarparkLocations();
});

$("#station_locations").click(function(){
	clearGlobals();
	getWeatherStations();
	timeoutID = setInterval(getWeatherStations,60*1000);
});


$("#rt_weather").click(function(){
	clearGlobals();
	getRainfall();
	createLegend(rainfallColorMap,rainfallValues,"Rainfall Level");
	timeoutID = setInterval(getRainfall,60*1000);
});

$("#clear-viz-btn").click(function(){
	clearGlobals();
	clearMap(mymap);
	this.blur();
});