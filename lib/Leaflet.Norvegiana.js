L.Norvegiana = L.LayerGroup.extend({

	options: {
		api: 'http://kulturnett2.delving.org/api/search',
		url: '{api}?query={query}&pt={pt}&d={d}',
		query: '*:*',
		pt: '{lat},{lng}',
		d: 1,
		params: {
			query: '*:*',
			pt: '59.337,5.97',
			d: 1,
			format: 'jsonp'
		}
	},

    initialize: function (options) {	
    	options = L.setOptions(this, options);
    	//console.log("init", options);

    	L.LayerGroup.prototype.initialize.call(this);
    	this.load(options.api + L.Util.getParamString(options.params), this.parse);



    },

    // http://kulturnett2.delving.org/api/search?query=*%3A*&pt=59.337%2C5.97&d=1&format=json
    load: function (url, callback) {
    	//console.log("url", url);
    	var self = this;
		reqwest({
			url: url,
			type: 'jsonp', 
			success: function (data) {
				if (data.result) {
					callback.call(self, data.result);
				}
			}
		});
    },

    parse: function (data) {
    	//console.log("parse", data.items);

		for (var i = 0, len = data.items.length; i < len; i++) {
			var item = data.items[i].item.fields;
			var latlng = item.abm_latLong[0].split(',');
			console.log(latlng, item.abm_propertyNr, item.abm_imageUri, item.dc_description);

			var marker = L.marker(latlng);
			this.addLayer(marker);
		}	

    }

});

L.norvegiana = function (options) {
	return new L.Norvegiana(options);
};