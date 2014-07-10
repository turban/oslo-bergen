/*

Highcharts.dateformat 
Simplify when zoomed out
Not 1k, 2k for alitude

http://www.highcharts.com/demo/dynamic-click-to-add
http://www.highcharts.com/demo/dynamic-update

Crossfilter
http://blog.rusty.io/2012/09/17/crossfilter-tutorial/

Nearest point
https://github.com/mapbox/leaflet-knn


*/
L.Elevation = L.Control.extend({
    includes: L.Mixin.Events,

	options: {
		clickZoom: 13, 
		minDistance: 10, // km - TODO: meters?
        marker: L.circleMarker(null, {
            radius: 6,
            stroke: true,
            fillColor: '#333',
            fillOpacity: 1,
            weight: 25,
            opacity: 0.2
        }),
        liveMarker: L.circleMarker(null, {
            radius: 5,
            color: 'orange',
            fillColor: '#333',
            fillOpacity: 1,
            className: 'leaflet-marker-live'            
        }),
        polyline: {
            color: '#333',
            opacity: 0.8,
            weight: 3,
            dashArray: [5,5]       
        },
        hitPolyline: {
            opacity: 0.1,
            weight: 35
        },
        label: '{name} {alt} moh.',
        chart: {
            chart: {
                type: 'areaspline',
                plotBorderWidth: 1,   
                zoomType: 'x' ,                
                resetZoomButton: {
                    theme: {
                        display: 'none'
                    }                   
                },
                animation: false,
                events: {}                
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },       
            xAxis: {
                reversed: true,
                minPadding: 0,
                maxPadding: 0,
                labels: {
                    formatter: function () {
                        return Math.round(this.value / 1000) + ' km';
                    }
                }           
            },
            yAxis: [{
                title: {
                    text: null
                },
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                },                
                min: 0
            }, {
                title: {
                    text: null
                },
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                },                   
                opposite: true,
                linkedTo: 0
            }],
            legend: {
                enabled: false
            },
            tooltip: {},
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    animation: false,
                    point: {
                        events: {}
                    }
                }
            },  
            series: [{}]
        },
        plotLine: {
            width: 1,
            color: '#333',
            dashStyle: 'Dot',
            zIndex: 5
        }
	},

	initialize: function (id, options) {	
        this._id = id;
        options = $.extend(true, this.options, options); // Deep copy

        if (options.data) {
            this.addData(options.data);
        }
	},

	onAdd: function (map) {
		return L.DomUtil.create('div'); // Chart is placed outside the map, return empty div
	},

    addData: function (data) {
        if (!this._data) { // first data added
            this._data = data; 
            this._drawMap(data);    
            this._drawChart(data);  
            this._createFilters(data); // Must be called after drawChart
        } else {
            this._update(data);
            this._crossfilter.add(data);
        }

        this._knnData = sphereKnn(this._data); // TODO: Possible to append data?    

        if (this.options.live) {
            this._map.addLayer(this.options.liveMarker.setLatLng(this._data[this._data.length - 1]));
        }
    },

	_createFilters: function (data) {
		var filter = this._crossfilter = crossfilter(data);
		this._filters = {
			byDist: filter.dimension(function(d) { return d.x; }),
			byLat:  filter.dimension(function(d) { return d.lat; }),
			byLng:  filter.dimension(function(d) { return d.lng; })
		}; 
	},

    // Better way to clear all filters?
    _clearFilters: function () {
        this._filters.byDist.filterAll();
        this._filters.byLat.filterAll();
        this._filters.byLng.filterAll();
        return this._filters;
    },

    _drawMap: function (data) {
        var map = this._map
            marker = this.options.marker,
            polyline = this._polyline = L.polyline(data, this.options.polyline).addTo(map),
            hitPolyline = this._hitPolyline = L.polyline(data, this.options.hitPolyline).addTo(map);

        this._map.fitBounds(polyline.getBounds()); 

        //hitPolyline.on('mouseover', this._onLineMouseOver, this);
        //hitPolyline.on('mouseout', this._onLineMouseOut, this);
        hitPolyline.on('mousemove', this._onLineMouseMove, this);

        // Map marker showing position
        marker.bindLabel('');
        marker.on('mousemove', this._onLineMouseMove, this);
        marker.on('mouseout', this._onMarkerMouseOut, this);
        marker.on('click', this._onMarkerClick, this);

        map.on('drag', this._onMapChange, this);
        map.on('zoomend', this._onMapChange, this);
    },

    _drawChart: function (data) {
        var series    = [],
            plotLines = [],
            chart     = this.options.chart,
            self      = this;

        // Create data series and plot lines
        for (var i = 0, len = data.length; i < len; i++) {
            var point = data[i];
            point.i = i;
            point.x = this._getDistance(point, data[i - 1]);
            series.push([point.x, point.alt]);
            if (point.type !== 'UNLIMITED-TRACK') {
                plotLines.push(this._getPlotLine(point));
            }
        }

        chart.chart.renderTo = this._id;
        chart.series[0].data = series;   
        chart.xAxis.plotLines = plotLines;             
        chart.chart.events.selection = L.bind(this._onChartSelection, this);
        chart.tooltip.formatter = function () { return self._showTooltip(this); };
        chart.plotOptions.series.point.events.click = function () { self._onChartClick(this); };
        chart.plotOptions.series.point.events.mouseOver = function () { self._onChartMouseOver(this); };
        chart.plotOptions.series.point.events.mouseOut = function () { self._onChartMouseOut(this); };        

        this._chart = new Highcharts.Chart(chart);
    },

    // Get distance between points
    _getDistance: function (point, prevPoint) {
        if (prevPoint) {
            return prevPoint.x + Math.round(L.latLng(point).distanceTo(L.latLng(prevPoint)));
        }
        return 0;
    },

    _getPlotLine: function (point) {
        return L.extend({
            value: point.x
            //label: { text: point.name || '' },
        }, this.options.plotLine);
    },

    _update: function (data) {
        var chart = this._chart,
            series = chart.series[0],
            xAxis = chart.xAxis[0],
            max = (xAxis.max === this._data[this._data.length-1].x),
            point,
            length;

        for (var i = 0; i < data.length; i++) {
            point = data[i],
            length = this._data.length;

            point.i = length;
            point.x = this._getDistance(point, this._data[length - 1]);

            this._data.push(point);

            //console.log(point.i);

            series.addPoint([point.x, point.alt], false);
            this._polyline.addLatLng(point);
            this._hitPolyline.addLatLng(point);

            if (point.type !== 'UNLIMITED-TRACK') {
                xAxis.addPlotLine(this._getPlotLine(point));
            }
        }

        this._chart.redraw();

        if (max) {
            xAxis.setExtremes(xAxis.min, point.x);
            this._chart.showResetZoom();
        }

    },


	// Zoom chart to map bounds
	_zoomChart: function () {
        var bounds  = this._map.getBounds(),
        	filters = this._filters;

        this._clearFilters();
        //filter.byLat.filter([bounds.getSouth(), bounds.getNorth()]);
        filters.byLng.filter([bounds.getWest(), bounds.getEast()]);

        if (filters.byDist.bottom(1).length) {
        	var firstPoint = filters.byDist.bottom(1)[0],
        		lastPoint = filters.byDist.top(1)[0],
        		start = firstPoint.x,
        		stop = lastPoint.x,
        		minDistance = this.options.minDistance;

        	// Don't allow span to be less than minDistance
        	if (stop < minDistance) {
        		start = 0;
        		stop = minDistance;
        	} else if (stop - start < minDistance) { 
        		start -= minDistance / 2;
        		stop  += minDistance / 2;
        	}

        	// Don't allow stop to be bigger than last point
			if (lastPoint.id === 'end' && stop > lastPoint.x) {
				start = lastPoint.x - (stop - start);
				stop = lastPoint.x;
        	}

        	//stop += 0.001; // Needed to show last point

            this._chart.xAxis[0].setExtremes(start, stop);
            this._chart.showResetZoom();
        } else {
            //console.log('No points!');
        }	
	},

	// Zoom map to chart selection (min/max distance)
	_zoomMap: function (min, max) {
		var filters = this._clearFilters();
        filters.byDist.filter([min, max]);
        if (filters.byLat.bottom(1)[0]) {
	        this._map.fitBounds([
	        	[filters.byLat.bottom(1)[0].lat, filters.byLng.bottom(1)[0].lng],
	        	[filters.byLat.top(1)[0].lat, filters.byLng.top(1)[0].lng]
	        ]);
        }
	},

	_onChartSelection: function (evt) {
    	var xAxis = evt.xAxis;
        if (xAxis) {
        	this._zoomMap(xAxis[0].min, xAxis[0].max);
        }
        return false; // Don't zoom chart, as it will be triggerd by map move
	},

	_onChartClick: function (point) {
        this.fire('chartclick', {
            point: point,
            marker: this.options.marker,
            data: this._getPointFromDistance(point.x)
        });
	},

	_onChartMouseOver: function (data) {
        var point = this._getPointFromDistance(data.x),
            map   = this._map;

        this.options.marker.setLatLng(point).addTo(map);
        this.options.marker.data = point;
        this.options.marker.closePopup();

        if (!map.getBounds().contains(L.latLng(point))) {
            map.panTo(point, {
                animate: true,
                duration: 1
            });
        }
	},

	_onChartMouseOut: function (data) {
        this._map.removeLayer(this.options.marker);
	},

	_onMapChange: function (evt) {
        //this._chart.tooltip.hide();
		this._zoomChart();

	},

    _onMarkerClick: function (evt) {
        this.fire('markerclick', {
            marker: this.options.marker,
            data: evt.target.data,
            point: this._chart.series[0].data[evt.target.data.i]
        });
    },

    _onLineMouseMove: function (evt) {
        var nearestPoint = this._getPointFromPosition(evt.latlng),
            map          = this._map,
            marker       = this.options.marker,
            chart        = this._chart
            point        = chart.series[0].data[nearestPoint.i]; // Chart point


        //console.log(nearestPoint);
        nearestPoint.name = nearestPoint.name || '';

        marker.setLatLng(nearestPoint).addTo(map);
        //marker.unbindLabel();
        //marker.bindLabel(L.Util.template(this.options.label, nearestPoint)).showLabel();

        marker.label.setLatLng(nearestPoint);
        marker.updateLabelContent(L.Util.template(this.options.label, nearestPoint));
        marker.data = nearestPoint;
        marker.closePopup();


        //http://stackoverflow.com/questions/11194527/highcharts-manually-trigger-hover-event-on-a-point
        if (this._point) {
            this._point.setState();
        }
        point.setState('hover'); 
        this._point = point;


        
        //chart.tooltip.refresh(point);
    },

    _onMarkerMouseOut: function (evt) {
        this._map.removeLayer(this.options.marker);
    },


	_showTooltip: function (data) {
        var point = this._getPointFromDistance(data.x),
            options = this.options,
            tooltip = '';

        if (point.name) tooltip += point.name;
        if (data.y) tooltip += ' ' + data.y + ' moh.';
        //if (tooltip) tooltip += '<br>'; 
        //tooltip +=  Math.round(data.x / 1000) + ' km';
		//if (options.start) tooltip += ' fra ' + (options.start.name || 'start');  
		return tooltip;
	},

    _getPointFromDistance: function (distance) {
        this._clearFilters();
        this._filters.byDist.filter(distance);
        return this._filters.byDist.top(1)[0];        
    },

    _getPointFromPosition: function (latlng) {
        return this._knnData(latlng.lat, latlng.lng, 1)[0];
    }

});

L.elevation = function (id, options) {
	return new L.Elevation(id, options);
};		
