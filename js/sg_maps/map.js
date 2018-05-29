// one and only singapore map
var sg_coords = [1.3521,103.8198]
var mymap = L.map('map-container',{zoomControl: false}).setView(sg_coords, 11);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    minZoom: 10,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicGxzZ3JhYiIsImEiOiJjamZ6Y2w4OHkweWF0MnFtbmR3Mmh2bTJxIn0.OpkABjTzNDKiK_1ab7JTpQ'
}).addTo(mymap);

function hideLoadingScreen() {
	$("#loadingScreen").hide();
}

function showLoadingScreen() {
	$("#loadingScreen").show();
}

function checkScreenWidth() {
	if ($(window).width() > 762) {return true}
	else {return false}
}

if (checkScreenWidth()) {

	L.control.zoom({
     position:'topright'
	}).addTo(mymap);
}

function clearMap(m,currentQuery) {
	if (m == null) {
		console.log("OK NOTHING TO CLEAR");
	}
	else {
		mymap.removeLayer(overlay);

		if (!(pinOverlay == null)) {
			mymap.removeLayer(pinOverlay);
			if ((!(currentQuery == null))&&(!(currentQuery===prevQuery))) {
				pinOverlay = null
			}
		}
	}

	if (legend == null){} else {
        mymap.removeControl(legend);
	}

}


function replaceHeaderText(text) {
	$("#navbar-text").text(text);
}

function getTime() {
	var dt = new Date();
	var time =  ("0" + dt.getHours()).slice(-2) + ":" + 
    			("0" + dt.getMinutes()).slice(-2) + ":" + 
    			("0" + dt.getSeconds()).slice(-2)
	return time
}

function lastUpdateHeader() {
	lastRunTime = getTime();
	replaceHeaderText("Last updated @ "+lastRunTime);
}

var initHeaderText = "Explore Visualizations"
replaceHeaderText(initHeaderText);


var overlay; // can change this to a list in the future, to allow multiple overlays to be added at the same time
var timeoutID;
var legend;
var lastRunTime;
var pinOverlay;
var dataStoreForSearch;
var prevQuery;
const rainfallColorMap = ['#FEEA06','#BEB83D','#7F8675','#3F54AD','#0022E5'] // blue to grey to yellow
const rainfallValues = [0,0.2,0.4,0.6,0.8]
const availabilityColorMap = ['#ff0000','#ffa500','#ffff00','#9acd32','#00ff00'] // green to yellow to red
const availabilityValues = [0,0.2,0.4,0.6,0.8]
const taxiSupplyColorMap = ['#0400E5','#0062E7','#01CBEA','#01EDA4','#02F03D','#31F302','#9EF603','#F9E503','#FC7A04','#FF0D05'] // magical rainbowwwww
const taxiSupplyValues = [0,5,10,15,20,25,30,35,40,45,50]


function getColor(value,colorMap,bins){
	for (j=1;j<bins.length;j++) {
		if (value<=bins[j]){
			return colorMap[j-1]
		}
	}
	return colorMap[colorMap.length-1]	
}

function clearGlobals() {
	if (timeoutID == null){} else {
		clearInterval(timeoutID);
	}

	if (legend == null){} else {
        mymap.removeControl(legend);
	}

	if (dataStoreForSearch == null) {} else {
		dataStoreForSearch = null
	}

	hideSearchbar(true);
}

function getWeatherStations() {
	$.ajax({
	  type: 'GET',
	  url: 'https://api.data.gov.sg/v1/environment/rainfall',
	  cache: false,
	  success: function(data){
	  	var Qname = "getWeatherStations"
		clearMap(overlay,Qname);
		var locs = data.metadata["stations"]
		var markerData = []
		for (i=0;i<locs.length;i++) {
			var lat = locs[i]["location"]["latitude"]
			var lng = locs[i]["location"]["longitude"]
			var popup = locs[i]["name"]
			markerData.push(L.marker([lat,lng]).bindPopup(popup));
		}
		overlay = L.layerGroup(markerData).addTo(mymap);
		hideLoadingScreen();
		prevQuery = Qname
	}
	});
}

function getRainfall() {
	$.ajax({
	  type: 'GET',
	  url: 'https://api.data.gov.sg/v1/environment/rainfall',
	  cache: false,
	  success: function(data){
	  	var Qname = "getRainfall"
		clearMap(overlay,Qname);
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
			color = getColor(weather_val,rainfallColorMap,rainfallValues);
			weatherData.push(
			L.circle(stn_loc,{
				color: color,
			    fillColor: color,
			    fillOpacity: 0.7,
			    radius: 500
			}));
		}
		overlay = L.layerGroup(weatherData).addTo(mymap);
		createLegend(rainfallColorMap,rainfallValues,"Rainfall Level");
		hideLoadingScreen();
		lastUpdateHeader();
		prevQuery = Qname
	}
	
	});
}

function createLegend(color_bins,bin_values,title){

	if (checkScreenWidth()) {
	    legend = L.control({position: 'topright'});
	} else {
		legend = L.control({position: 'bottomright'}); 
	}

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

// function getCarparkLocations(){
// 	var data = {
// 	  resource_id: '139a3035-e624-4f56-b63f-89ae28d4ae4c' // the resource id
// 	};
// 	$.ajax({
// 	  url: "https://data.gov.sg/api/action/datastore_search",
// 	  // url: 'https://api.da.gov.sg/v1/transport/carpark-availability',
//   	  data: data,
// 	  success: function(data){
// 		clearMap(overlay);	
// 		var carparks = data["result"]["records"]
// 		var carparkData = []
// 		var carparkPos = JSON.parse(carparkPosData);
// 		var carparkNo,lat,lng,popup;
// 		for (i=0;i<carparks.length;i++) {
// 			carparkNo = carparks[i]["car_park_no"]
// 			lat = carparkPos[carparkNo]["lat"]
// 			lng = carparkPos[carparkNo]["lng"]
// 			popup = '<b>'+carparkPos[carparkNo]["address"]+'</b><br><br>'+carparkPos[carparkNo]["car_park_type"]
// 			carparkData.push(L.marker([lat,lng]).bindPopup(popup));
// 		}
// 		overlay = L.layerGroup(carparkData).addTo(mymap);
// 	}
// 	});
// }


function getCarparkAvailability(){
	$.ajax({
	  type: 'GET',
	  cache: true,
	  url: 'https://api.data.gov.sg/v1/transport/carpark-availability',
	  success: function(data){
	  	var Qname = "getCarparkAvailability"
		clearMap(overlay,Qname);
		var carparks = data["items"][0]["carpark_data"]
		var carparkPos = JSON.parse(carparkPosData);
		var carparkData = []
		var carparkNo,carparkInfo,popup,carparkCoords,lot_ratio;	
		overlay = L.canvas({ padding: 0.5 });	
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
			color = getColor(lot_ratio,availabilityColorMap,availabilityValues);
			L.circle(carparkCoords,{
				color: color,
			    fillColor: color,
			    fillOpacity: 0.7,
			    radius: 100,
			    renderer: overlay
			}).bindPopup(popup).addTo(mymap);

			carparkData.push({
				"coords": carparkCoords,
				"datatype": "cpavail",
				"description": carparkPos[carparkNo]["address"],
				"lots_available": lots_available,
				"total_lots": total_lots
			})
		}

		dataStoreForSearch = carparkData

		if (!(pinOverlay == null)) {
			pinOverlay.addTo(mymap);
		}
		createLegend(availabilityColorMap,availabilityValues,"Carpark Availability");
		lastUpdateHeader();
		hideLoadingScreen();
		loadSearchbar("Enter a location (eg. 1 Rochor Rd)",checkScreenWidth());
		prevQuery = Qname
	}
	});
}


function createGeohashLayer(aggData,colorMap,bins,popup_msg) {
	var geohashLayer = []
	var color,popup;	
	overlay = L.canvas({ padding: 0.5 });	
	for (var geohash in aggData) {
		color = getColor(aggData[geohash],colorMap,bins)
		// geohashLayer.push(
		// 	L.polygon(sg_ghdata[geohash]).setStyle({
		// 		fillOpacity: 0.5,
		// 		fillColor: color,
		// 		weight: 0
		// 	}).bindPopup(popup_msg+aggData[geohash])
		// 	);
		L.polygon(sg_ghdata[geohash]).setStyle({
			fillOpacity: 0.5,
			fillColor: color,
			weight: 0,
			renderer: overlay
		}).bindPopup(popup_msg+aggData[geohash]).addTo(mymap);		
	}
	return geohashLayer
}


function getTaxiAvailability(){
	$.ajax({
	  type: 'GET',
	  url: 'https://api.data.gov.sg/v1/transport/taxi-availability',
	  cache: false,
	  contentType: 'application/vnd.geo+json',
	  success: function(data){
		  	var Qname = "getTaxiAvailability"
			clearMap(overlay,Qname);
			var taxiData = []
			var taxiLocs = data["features"][0]["geometry"]["coordinates"]
			var taxiCount = {}
			for (var key in sg_ghdata) {
				taxiCount[key] = 0
			} 
			var lat,lng,gh;
			for (i=0;i<taxiLocs.length;i++) {
				lng = taxiLocs[i][0]
				lat = taxiLocs[i][1]
				gh = Geohash.encode(lat,lng,6)
				if (taxiCount.hasOwnProperty(gh)) {
					taxiCount[gh] += 1
				}
				taxiData.push({
					"coords": [lat,lng],
					"datatype": "taxiavail"
				});
			}
			var popup_msg = '<b>Taxi Count:</b> '
			var geohashLayer = createGeohashLayer(taxiCount,taxiSupplyColorMap,taxiSupplyValues,popup_msg);
			dataStoreForSearch = taxiData
	  		// overlay = L.layerGroup(geohashLayer).addTo(mymap);

			if (!(pinOverlay == null)) {
				pinOverlay.addTo(mymap);
			}
	  		createLegend(taxiSupplyColorMap,taxiSupplyValues,"Taxis Available");
	  		hideLoadingScreen();
			lastUpdateHeader();
			loadSearchbar("Enter a location (eg. 1 Rochor Rd)",checkScreenWidth());
			prevQuery = Qname
		}
	});
}

function latlngDistCalc(coord1,coord2) {
	var latdiff = Math.abs(coord1[0] - coord2[0])
	var lngdiff = Math.abs(coord1[1] - coord2[1])
	var coordDist = (latdiff**2 + lngdiff**2)**0.5
	return coordDist*111.32 // return in Km
}

function pointDescription(center,address) {
	var dtype = dataStoreForSearch[0]["datatype"]
	switch(dtype) {
		case "cpavail":
			var nearbyCp = []
			for (var key in dataStoreForSearch) {
				var coords = dataStoreForSearch[key]["coords"]
				var desc = dataStoreForSearch[key]["description"]
				var total_lots = dataStoreForSearch[key]["total_lots"]
				var lots_available = dataStoreForSearch[key]["lots_available"]
				var coordDist = latlngDistCalc(center,coords)
				if (coordDist < 2) {
					nearbyCp.push([coordDist,desc,total_lots,lots_available]);
				}
			}
			var sortedCP = nearbyCp.sort(function(a,b){return Number(b[3])-Number(a[3])}); // sort by lots available
			var popup_msg = 'HDB carparks within 2km with most lots:<br><br>'

			for (var i=0;i<3;i++) {
				coordDist = sortedCP[i][0]
				desc = sortedCP[i][1]
				total_lots = sortedCP[i][2]
				lots_available = sortedCP[i][3]
				popup_msg += '<b>' + desc + ':</b><br> ' + lots_available + ' lots available, ' + coordDist.toFixed(2) + 'km away<br>'
			}
			return popup_msg


		case "taxiavail":
			var nearbyTaxi = 0
			for (var key in dataStoreForSearch) {
				var coords = dataStoreForSearch[key]["coords"]
				var coordDist = latlngDistCalc(center,coords)
				if (coordDist < 2) {
					nearbyTaxi += 1;
				}
			}
			var popup_msg = 'Taxi count within 2km of <br><b>' + address + '</b><br><br>' + nearbyTaxi
			return popup_msg
		}
}

function getLocationPin(coords,address){
	if (!(pinOverlay == null)){
		mymap.removeLayer(pinOverlay);
	}
	var details = pointDescription(coords,address);
	var pinData = [ L.marker(coords).bindPopup(details), // can change icon!!
					L.circle(coords, {
										radius: 2000,
										fillColor: "#ff0000",
										fillOpacity: 0.5,
										stroke: false,
										interactive: false
									})]
	pinOverlay = L.layerGroup(pinData).addTo(mymap);
	mymap.setView(coords,mymap._zoom);
}