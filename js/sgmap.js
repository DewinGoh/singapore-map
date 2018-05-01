
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
    for(i in m._layers) {
        if(m._layers[i]._path != undefined) {
            try {
                m.removeLayer(m._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + m._layers[i]);
            }
        }
    }
}

$("#station_locations").click(function(){
	clearMap(mymap);
	$.ajax({
	  type: 'GET',
	  url: 'https://api.data.gov.sg/v1/environment/rainfall',
	  cache: false,
	  success: function(data){	
		var locs = data.metadata["stations"]
		for (i=0;i<locs.length;i++) {
			L.marker([locs[i]["location"]["latitude"],locs[i]["location"]["longitude"]]).addTo(mymap);
		}
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
	clearMap(mymap);
	$.ajax({
	  type: 'GET',
	  url: 'https://api.data.gov.sg/v1/environment/rainfall',
	  cache: false,
	  success: function(data){
		var locs = data.metadata["stations"]
		var allweather = data.items[0].readings
		for (i=0;i<locs.length;i++) {
			stn = locs[i]["id"]
			stn_name = locs[i]["name"]
			stn_loc = [locs[i]["location"]["latitude"],locs[i]["location"]["longitude"]]
			weather_stn = allweather[i]["station_id"]
			weather_val = allweather[i]["value"]
			L.circle(stn_loc,{
			    fillColor: colorMapWeather(weather_val),
			    fillOpacity: 0.7,
			    radius: 500
			}).addTo(mymap);
		}
	}
	});
});