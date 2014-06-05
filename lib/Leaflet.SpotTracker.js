L.SpotTracker = L.LayerGroup.extend({
	options: {
		api: 'https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/',
		url: '{api}{feed}/message.json',
		live: true,
		liveUrl: '{api}{feed}/message.json?startDate={startDate}',
		liveInterval: 10, // minutes
		liveMarker: {
			radius: 5,
			color: 'orange',
			fillColor: '#333',
			fillOpacity: 1,
			className: 'leaflet-marker-live'			
		},
		focus: false,
		fitBounds: true,
		marker: {
			radius: 5,
			color: '#333',
			fillOpacity: 1,
			stroke: false
		},		
		line: {
			color: '#333', 
			weight: 3, 
			dashArray: '5,5'
		},
		show: {
			'UNLIMITED-TRACK': 12,
			'OK': 14,
			'CUSTOM': 14
		}
	},

	initialize: function(feed, options) {
		options = options || {};
		options.feed = feed;
		L.setOptions(this, options);

		this.markers = {};
		this.polyline = L.polyline([], this.options.line);
		L.LayerGroup.prototype.initialize.call(this);
	},

	onAdd: function (map) {
		var options = this.options;
		this._map = map;
		this.load(L.Util.template(options.url, options), this.onLoad); // Load data
		map.on('zoomend', this.toggleMarkers, this);
	},

	onClick: function (evt) {
		if (this.options.onClick) {
			evt.message = evt.layer.options.message;
			this.options.onClick(evt);
		}
	},

	load: function (url, callback) {
		var self = this;
		reqwest({
			url: url,
			type: 'jsonp', // SPOT don't support CORS
			success: function (data) {
				if (data.rows) { // CartoDB
					callback.call(self, data.rows);
				} else { // SPOT
					if (data.response && data.response.feedMessageResponse) {
						data = data.response.feedMessageResponse.messages.message;
						if (!L.Util.isArray(data)) {
							data = [data];
						}					
					} else {
						data = []
					}
					callback.call(self, data.reverse());
				}
			}
		});
	},

	onLoad: function (messages) {
		var options = this.options,
		    self = this;

		if (options.live) {
			setInterval(function(){
				var timestamp = parseInt(Date.now() / 1000);		
				if (timestamp > options.timestamp) {
					self.load(L.Util.template(options.liveUrl, options), self.draw);
				}
			}, options.liveInterval * 60000); 
		}

		this.draw(messages);
	},

	draw: function (messages) {
		if (messages.length) {
			var options = this.options,
				message, latlng, type, markerOptions;

			for (var i = 0, len = messages.length; i < len; i++) {
				message = messages[i];
				latlng = L.latLng(message.latitude, message.longitude);
				type =  message.messageType || message.message_type;			
				markerOptions = L.extend({ message: message }, options[type] || options.marker);

				this.markers[type] = this.markers[type] || L.featureGroup().on('click', this.onClick, this);

				if (markerOptions.radius) {
					this.markers[type].addLayer(L.circleMarker(latlng, markerOptions));
				} else {
					this.markers[type].addLayer(L.marker(latlng, markerOptions));
				}

				this.polyline.addLatLng(latlng);
			}

			if (!this.hasLayer(this.polyline)) {
				this.addLayer(this.polyline);
				if (options.fitBounds) {
					this._map.fitBounds(this.polyline.getBounds());
				}
			}

			this.toggleMarkers();

			if (options.focus) {
				this._map.setView(latlng, options.focus);
			}

			if (options.live) {
				if (this._liveMarker) {
					this.removeLayer(this._liveMarker);
				}
				this._liveMarker = L.circleMarker(latlng, L.extend({ message: message }, options.liveMarker)).on('click', this.onClick, this);
				this.addLayer(this._liveMarker);
				options.timestamp = message.unixTime || message.timestamp; // TODO unix_time
				options.startDate = new Date(++options.timestamp * 1000).toISOString().slice(0, -5) + '-0000';
			}
		}
	},

	toggleMarkers: function () {
		var zoom = this._map.getZoom(),
			show = this.options.show;

		for (var type in this.markers) {
			if (this.markers.hasOwnProperty(type)) {
				var markers = this.markers[type];
				if (zoom < show[type]) {
					this.removeLayer(markers);
				} else {
					this.addLayer(markers);
				}
			} 
		}
	}

});

L.spotTracker = function (feed, options) {
	return new L.SpotTracker(feed, options);
};