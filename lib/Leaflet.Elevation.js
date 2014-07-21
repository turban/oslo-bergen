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
		//clickZoom: 13, 
		minDistance: 10, // km - TODO: meters?
        marker: L.circleMarker(null, { // Mouseover marker
            radius: 6,
            stroke: true,
            fillColor: '#333',
            fillOpacity: 1,
            weight: 25,
            opacity: 0
        }),
        liveMarker: L.circleMarker(null, { // Latest position marker
            radius: 5,
            color: 'orange',
            fillColor: '#333',
            fillOpacity: 1,
            className: 'leaflet-marker-live'            
        }),
        polyline: { // Track line
            color: '#333',
            opacity: 0.8,
            weight: 3,
            dashArray: [5,5]       
        },
        hitPolyline: { // Invisible thick track line
            opacity: 0,
            weight: 35
        },
        label: function (data) {
            return ((data.name) ? data.name + ' ' : '') + ((data.alt !== null) ? data.alt + ' moh.' : '');
        },
        chart: { // Highcharts options
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
                events: {},
                marginTop: 20                
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },       
            xAxis: {
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
                    marker: {
                        enabled: false
                    },
                    point: {
                        events: {}
                    }
                }
            },  
            series: [{}]
        },
        plotLine: { // Plotline style to mark specific positions
            width: 1,
            color: '#333',
            dashStyle: 'Dot',
            zIndex: 5
        }
	},

    // Constructor
	initialize: function (id, options) {	
        this._id = id;
        options = $.extend(true, this.options, options); // Deep copy
        if (options.data) {
            this.addData(options.data);
        }
	},

    // Called when control is added to map
	onAdd: function (map) {
		return L.DomUtil.create('div'); // Chart is placed outside the map, return empty div
	},

    // Add track array (can be called multiple times)
    addData: function (data) {
        //console.log("data", data);

        if (!this._data) { // First data added
            this._data = data; 
            this._drawMap(data);    
            this._drawChart(data);  
            this._createFilters(data); // Must be called after drawChart to have distance/x values
        } else {
            this._update(data);
            this._crossfilter.add(data);
        }

        this._knnData = sphereKnn(this._data); // TODO: Possible to append data?    

        if (this.options.live) { // Add/move live marker for last position
            this._map.addLayer(this.options.liveMarker.setLatLng(this._data[this._data.length - 1]));
        }
    },

    // Call this method to redraw chart when container size has changed
    reflow: function () {
        this._chart.reflow();
    },

    // Crossfilter: Create distance, latitude and longitude dimensions
	_createFilters: function (data) {
		var filter = this._crossfilter = crossfilter(data);
		this._filters = {
			byDist: filter.dimension(function(d) { return d.x; }),
			byLat:  filter.dimension(function(d) { return d.lat; }),
			byLng:  filter.dimension(function(d) { return d.lng; })
		}; 
	},

    // Crossfilter: Clear filters for all dimensions
    // Todo: Is there a better way to do this?
    _clearFilters: function () {
        this._filters.byDist.filterAll();
        this._filters.byLat.filterAll();
        this._filters.byLng.filterAll();
        return this._filters;
    },

    // Crossfilter: Get point from distance
    _getPointFromDistance: function (distance) {
        this._clearFilters();
        this._filters.byDist.filter(distance);
        return this._filters.byDist.top(1)[0];        
    },

    // Crossfilter: Get min and max distance from map bounds
    // TODO: Use in _zoomChart
    _getDistanceFromBounds: function (bounds) {
        var filters = this._filters;

        this._clearFilters();
        //filter.byLat.filter([bounds.getSouth(), bounds.getNorth()]);
        filters.byLng.filter([bounds.getWest(), bounds.getEast()]);

        if (filters.byDist.bottom(1).length) {
            return [filters.byDist.bottom(1)[0].x, filters.byDist.top(1)[0].x];
        }

    },

    // Draw map
    _drawMap: function (data) {
        var map = this._map
            marker = this.options.marker,
            polyline = this._polyline = L.polyline(data, this.options.polyline).addTo(map),
            hitPolyline = this._hitPolyline = L.polyline(data, this.options.hitPolyline).addTo(map);

        // Fit map to track bounds
        this._map.fitBounds(polyline.getBounds()); 

        hitPolyline.on('mousemove', this._onMouseMove, this);

        // Map marker showing position
        marker.bindLabel('');
        marker.on('mousemove', this._onMouseMove, this);
        marker.on('mouseout', this._onMarkerMouseOut, this);
        marker.on('click', this._onMarkerClick, this);

        // Sync chart on map pan and zoom
        map.on('drag', this._zoomChart, this);
        map.on('zoomend', this._zoomChart, this);
    },

    // Draw elevation chart
    _drawChart: function (data) {
        var series      = [],
            plotLines   = [],
            chart       = this.options.chart,
            self        = this,
            seriesCount = 0,
            prevPoint;

        // Create data series and plot lines
        for (var i = 0, len = data.length; i < len; i++) {
            var point = data[i];

            if (point.alt !== null) {
                point.i = seriesCount++;
                point.x = this._getDistance(point, prevPoint);             
                series.push([point.x, point.alt]);
                prevPoint = point;                
            }
            if (point.type !== 'UNLIMITED-TRACK') { // TODO: Create option
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

    // Calculate distance between points
    _getDistance: function (point, prevPoint) {
        if (prevPoint) {
            return prevPoint.x + Math.round(L.latLng(point).distanceTo(L.latLng(prevPoint)));
        }
        return 0;
    },

    // Chart: Create plotline for one point - TODO: Add names for if space
    _getPlotLine: function (point) {
        return L.extend({
            value: point.x
            //label: { text: point.name || '' },
        }, this.options.plotLine);
    },

    // Update map and chart with new data
    _update: function (data) {
        var chart  = this._chart,
            series = chart.series[0],
            xAxis  = chart.xAxis[0],
            max    = (xAxis.max === this._data[this._data.length-1].x), // True if chart shows max distance
            point,
            length;

        for (var i = 0; i < data.length; i++) {
            point = data[i],
            length = this._data.length;

            point.i = length;
            point.x = this._getDistance(point, this._data[length - 1]);

            this._data.push(point);

            series.addPoint([point.x, point.alt], false); // Add point to chart
            this._polyline.addLatLng(point); // Add point to map line
            this._hitPolyline.addLatLng(point); // Add point to hidden map line

            if (point.type !== 'UNLIMITED-TRACK') { // TODO: Create option
                xAxis.addPlotLine(this._getPlotLine(point));
            }
        }

        this._chart.redraw(); // Redraw chart after all new points are added

        if (max) { // Expand chart if max value is shown
            xAxis.setExtremes(xAxis.min, point.x);
            this._chart.showResetZoom();
        }

    },

	// Zoom chart to map bounds
	_zoomChart: function () {
        var distance = this._getDistanceFromBounds(this._map.getBounds());

        if (distance) {
            //console.log("##", distance);

        	var start = distance[0],
        		stop = distance[1],
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
			//if (lastPoint.id === 'end' && stop > lastPoint.x) {
			//	start = lastPoint.x - (stop - start);
			//	stop = lastPoint.x;
        	//}

        	//stop += 0.001; // Needed to show last point

            this._chart.xAxis[0].setExtremes(start, stop);
            this._chart.showResetZoom();
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

    // Map event handler: Update chart on pan and zoom
    /*
	_onMapChange: function (evt) {
		this._zoomChart();
	},
    */

    // Fire event on map marker click passing marker, chart point and data object
    _onMarkerClick: function (evt) {
        this.fire('markerclick', {
            marker: this.options.marker,
            point: this._chart.series[0].data[evt.target.data.i],
            data: evt.target.data
        });
    },

    // Map event handler: On line/marker mouse move
    _onMouseMove: function (evt) {
        var nearestPoint = this._getPointFromPosition(evt.latlng),
            map          = this._map,
            marker       = this.options.marker;

        marker.setLatLng(nearestPoint).addTo(map);

        if (nearestPoint.alt !== null) {
            marker.label.setLatLng(nearestPoint);
            marker.updateLabelContent(this.options.label(nearestPoint));   
        } else {
            marker.hideLabel();
        }

        marker.data = nearestPoint;
        marker.closePopup();

        //http://stackoverflow.com/questions/11194527/highcharts-manually-trigger-hover-event-on-a-point
        if (this._point) {
            this._point.setState();
        }

        if (nearestPoint.i !== undefined) {
            var point = this._chart.series[0].data[nearestPoint.i];
            point.setState('hover'); 
            this._point = point;
        } 
    },

    // Remove position marker on mouse out
    _onMarkerMouseOut: function (evt) {
        this._map.removeLayer(this.options.marker);
        this._point.setState(); // Remove chart hover state
    },

    // Chart tooltip function
    // TODO: Same look as map label
	_showTooltip: function (data) {
        var point = this._getPointFromDistance(data.x),
            options = this.options,
            tooltip = '';

        if (point.name) tooltip += point.name;
        if (data.y) tooltip += ' ' + data.y + ' moh.';
		return tooltip;
	},

    // Get closest point to lat/lng position
    _getPointFromPosition: function (latlng) {
        return this._knnData(latlng.lat, latlng.lng, 1)[0];
    }

});

L.elevation = function (id, options) {
	return new L.Elevation(id, options);
};		
