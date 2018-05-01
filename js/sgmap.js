
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

$("#station_locations").click(function(){
	clearMap(overlay);
	$.ajax({
	  type: 'GET',
	  url: 'https://api.data.gov.sg/v1/environment/rainfall',
	  cache: false,
	  success: function(data){	
		var locs = data.metadata["stations"]
		var markerData = []
		for (i=0;i<locs.length;i++) {
			markerData.push(L.marker([locs[i]["location"]["latitude"],locs[i]["location"]["longitude"]]));
		}
		overlay = L.layerGroup(markerData).addTo(mymap);
	}
	});
});

function colorMapWeather(value) {
	if (value <= 0.1) {
		return '#FEEA06'
	} 
	else if (value <= 0.3) {
		return '#BEB83D'
	}
	else if (value <= 0.5) {
		return '#7F8675'
	}
	else if (value <= 0.7) {
		return '#3F54AD'
	}
	else {
		return '#0022E5'
	}
}

$("#rt_weather").click(function(){
	clearMap(overlay);
	$.ajax({
	  type: 'GET',
	  url: 'https://api.data.gov.sg/v1/environment/rainfall',
	  cache: false,
	  success: function(data){
		var locs = data.metadata["stations"]
		var allweather = data.items[0].readings
		var weatherData = []
		for (i=0;i<locs.length;i++) {
			stn = locs[i]["id"]
			stn_name = locs[i]["name"]
			stn_loc = [locs[i]["location"]["latitude"],locs[i]["location"]["longitude"]]
			weather_stn = allweather[i]["station_id"]
			weather_val = allweather[i]["value"]
			var color = colorMapWeather(weather_val)
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
});