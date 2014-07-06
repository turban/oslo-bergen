/* 
http://openwps.statkart.no/skwms1/wps.elevation?request=Execute&service=WPS&version=1.0.0&identifier=elevationJSON&datainputs=%5bgpx=http://dl.dropboxusercontent.com/u/2306934/gpx/nedstrand.gpx%5d
http://openwps.statkart.no/skwms1/wps.elevation?request=Execute&service=WPS&version=1.0.0&identifier=elevationJSON&datainputs=%5bgpx=http://dl.dropboxusercontent.com/u/2306934/gpx/etappe1.gpx%5d
http://openwps.statkart.no/skwms1/wps.elevation?request=Execute&service=WPS&version=1.0.0&identifier=elevationChart&datainputs=%5bgpx=http://dl.dropboxusercontent.com/u/2306934/gpx/etappe1.gpx%5d
*/


	var route = [{
		"name": "Lillogata",
		"description": "Start", 
		"latlng": [59.942980, 10.767825],
		"marker": { "icon": "circle-stroked", "color": "#145291", "size": "l" }
	},{
		"name": "<a href='http://ut.no/hytte/sinnerdammen'>Sinnerdammen</a>",
		"description": "Ubetjent", 
		"latlng": [60.169, 10.496],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "Hvalstjern",
		"description": "Telt", 
		"latlng": [60.275, 10.233],
		"marker": { "icon": "campsite", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/tjuvenborgkoia'>Tjuenborgkoia</a>",
		"description": "Ubetjent",
		"latlng": [60.339, 9.977],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/buvasskoia'>Buvasskoia</a>",
		"description": "Ubetjent",
		"latlng": [60.407, 9.775],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/storekrakkoia'>Storekrakkoia</a>",
		"description": "Ubetjent",
		"latlng": [60.497, 9.711],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/vassfarkoia'>Vassfarkoia</a>",
		"description": "Ubetjent",
		"latlng": [60.496, 9.468],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/f%C3%B8nhuskoia'>Fønhuskoia</a>",
		"description": "Ubetjent",
		"latlng": [60.61, 9.432],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "Valdreslihovda",
		"description": "Telt", 
		"latlng": [60.676, 9.269],
		"marker": { "icon": "campsite", "color": "#145291", "size": "m" }
	},{
		"name": "Golsfjellet",
		"description": "<a href='http://www.kamben.no/'>Kamben Høyfjellshotell</a>",
		"latlng": [60.802, 8.98],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "Buhovdvatnet",
		"description": "Telt", 
		"latlng": [60.742, 8.675],
		"marker": { "icon": "campsite", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://www.bergsjostolen.no'>Bergsjøstølen</a>",
		"description": "Fjellstove", 
		"latlng": [60.716, 8.291],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/iungsdalshytta'>Iungsdalshytta</a>",
		"description": "Betjent", 
		"latlng": [60.81, 7.934],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/kongshelleren'>Kongshelleren</a>",
		"description": "Selvbetjent", 
		"latlng": [60.777, 7.701],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/geiterygghytta'>Geiterygghytta</a>",
		"description": "Betjent", 
		"latlng": [60.701, 7.604],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/hallingskeid'>Hallingskeid</a>",
		"description": "Selvbetjent", 
		"latlng": [60.668, 7.248],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/kaldavasshytta'>Kaldavasshytta</a>",
		"description": "Ubetjent", 
		"latlng": [60.702, 7.08],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "Mjølfjell",
		"description": "<a href='http://www.mjolfjell.no'>Fjellstove</a>", 
		"latlng": [60.703, 6.937],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "Raundalsryggen",
		"description": "Telt", 
		"latlng": [60.637, 6.712],
		"marker": { "icon": "campsite", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://www.vosscamping.no'>Voss</a>",
		"description": "Voss Camping", 
		"latlng": [60.624931, 6.421740],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/torfinnsheim'>Torfinnsheim</a>",
		"description": "Ubetjent", 
		"latlng": [60.562, 6.243],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/vending-turisthytte'>Vending</a>",
		"description": "Selvbetjent", 
		"latlng": [60.474, 6.075],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "<a href='http://ut.no/hytte/hoegabu'>Høgabu</a>",
		"description": "Selvbetjent", 
		"latlng": [60.535, 5.926],
		"marker": { "icon": "building", "color": "#145291", "size": "m" }
	},{
		"name": "Holmavatnet",
		"description": "Telt", 
		"latlng": [60.425, 5.682],
		"marker": { "icon": "campsite", "color": "#145291", "size": "m" }
	}, {
		"name": "Nordåsgrenda",
		"description": "Mål", 
		"latlng": [60.31, 5.324],
		"marker": { "icon": "bar", "color": "#145291", "size": "l" }		
	}];

var pointsPerDay = 100,
	coords = [],
	startDate = new Date(2014, 7, 1, 10).getTime();

for (var i = 1, point; i < route.length; ++i) {
	var point1 = route[i - 1].latlng,
		point2 = route[i].latlng,
		line   = [];

	point1 = new LatLon(point1[0], point1[1]);
	point2 = new LatLon(point2[0], point2[1]);

	distance = point1.distanceTo(point2);  
	bearing  = point1.bearingTo(point2);

	var t = 0;
	for (var x = 0; x < distance; x += distance / pointsPerDay) {
		var point = point1.destinationPoint(bearing, x);
		line.push([point.lat, point.lon, startDate + (i * 86400000) + (t * 300000)]); 
		t++;
	}

	coords.push(line);
}

console.log(JSON.stringify(coords));

