var stops = [{
	name: 'Lillogata',
	latlng: [59.942980, 10.767825]
},{
	name: 'Sinnerdammen',
	latlng: [60.169, 10.496]
},{
	name: 'Hvalstjern (telt)',
	latlng: [60.275, 10.233]
},{
	name: 'Tjuenborgkoia',
	latlng: [60.339, 9.977]
},{
	name: 'Storekrakkoia',
	latlng: [60.497, 9.711]
},{
	name: 'Fønhuskoia',
	latlng: [60.61, 9.432]
},{
	name: 'Valdreslihovda (telt)',
	latlng: [60.676, 9.269]
},{
	name: 'Golsfjellet',
	latlng: [60.802, 8.98]
},{
	name: 'Buhovdvatnet (telt)',
	latlng: [60.742, 8.675]
},{
	name: 'Bergsjøstølen',
	latlng: [60.716, 8.291]
},{
	name: 'Iungsdalshytta',
	latlng: [60.81, 7.934]
},{
	name: 'Kongshelleren',
	latlng: [60.777, 7.701]
},{
	name: 'Geiterygghytta',
	latlng: [60.701, 7.604]
},{
	name: 'Hallingskeid',
	latlng: [60.668, 7.248]
},{
	name: 'Kaldavasshytta',
	latlng: [60.702, 7.08]
},{
	name: 'Mjølfjell',
	latlng: [60.703, 6.937]
},{
	name: 'Raundalsryggen (telt)',
	latlng: [60.637, 6.712]
},{
	name: 'Bulko',
	latlng: [60.555, 6.613]
},{
	name: 'Rongastovo',
	latlng: [60.515, 6.478]
},{
	name: 'Torfinnsheim',
	latlng: [60.562, 6.243]
},{
	name: 'Vending',
	latlng: [60.474, 6.075]
},{
	name: 'Gullhorgabu',
	latlng: [60.5011, 5.9533]
},{
	name: 'Holmavatnet (telt)',
	latlng: [60.425, 5.682]
},{
	name: 'Nordåsgrenda',
	latlng: [60.309, 5.323]
}];

var map = L.map('map').setView([60.5, 8], 8);

L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norges_grunnkart&zoom={z}&x={x}&y={y}', {
	attribution: '&copy; <a href="http://osm.org/copyright">Kartverket</a>'
}).addTo(map);

for (var i = 0; i < stops.length; i++) { 
	var stop = stops[i];
	L.marker(stop.latlng).addTo(map).bindPopup(stop.name);
}
