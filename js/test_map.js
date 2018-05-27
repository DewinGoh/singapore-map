// one and only singapore map
var sg_coords = [1.3521,103.8198]
var mymap = L.map('map-container',
	{
		zoomControl: false
	}).setView(sg_coords, 11);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    minZoom: 10,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicGxzZ3JhYiIsImEiOiJjamZ6Y2w4OHkweWF0MnFtbmR3Mmh2bTJxIn0.OpkABjTzNDKiK_1ab7JTpQ'
}).addTo(mymap);

L.control.zoom({
     position:'topright'
}).addTo(mymap);



// var center = [1.3521,103.8198]
// var circle = L.circle(center, { renderer: myRenderer, radius:500 } );

// circle.addTo(mymap);

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

function clearMap(m) {
	if (m == null) {
		console.log("OK NOTHING TO CLEAR");
	}
	else {
		mymap.removeLayer(overlay);
	}

	if (legend == null){} else {
        mymap.removeControl(legend);
	}

}

var overlay;

function getCarparkAvailability(){
	$.ajax({
	  type: 'GET',
	  cache: true,
	  url: 'https://api.data.gov.sg/v1/transport/carpark-availability',
	  success: function(data){
		var carparks = data["items"][0]["carpark_data"]
		var carparkData = []
		var carparkPos = JSON.parse(carparkPosData);
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
			L.circleMarker(carparkCoords,{
				color: color,
			    fillColor: color,
			    fillOpacity: 0.7,
			    radius: 1,
			    renderer: overlay
			}).bindPopup(popup).addTo(mymap);
		}
		// overlay = L.layerGroup(carparkData).addTo(mymap);
		// createLegend(availabilityColorMap,availabilityValues,"Carpark Availability");
	}
	});
}

getCarparkAvailability();

 $('#sidebarCollapse').click(function() {
     $('#sidebar').toggleClass('active');
     clearMap(mymap);
 });


