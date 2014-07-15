//$(function () { 

    var bounds = [[59.1, 4.8], [59.5, 6.0]];

    // create an orange rectangle

    var map = L.map('map', {
        maxZoom: 14
    }).fitBounds(bounds);

    L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norges_grunnkart&zoom={z}&x={x}&y={y}', {
        attribution: '&copy; <a href="http://kartverket.no/">Kartverket</a>'
    }).addTo(map);

    //L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);

    var feed_id = '0aLGfxvzuXWg1QsNq3TMjy7il9qWNinEc',
        update = 5, // minutes between updates
        cartodb_id = 131; // cartodb_id Instagram start

    var elevation = L.elevation('elevation', {
        live: true
    }).addTo(map); 

    elevation.on('markerclick chartclick', function(evt) {
        var data = evt.data;
        //console.log(evt.type, evt.data);
        evt.marker.bindPopup(getPlace(data) + getTime(data.time) + getWeather(data)).openPopup();
    });

    $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT cartodb_id AS id, placename AS name, terrain, latitude AS lat, longitude AS lng, altitude AS alt, placename AS name, message_type AS type, timestamp AS time, weather_symbol AS weather, temperature AS temp, precipitation AS precip, wind, wind_speed, wind_direction AS wind_dir FROM spot WHERE feed_id='" + feed_id + "' AND altitude IS NOT NULL ORDER BY timestamp", function(data) {
        elevation.addData(data.rows);
        var id = data.rows[data.rows.length - 1].id;
        setInterval(function(){
            $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT cartodb_id AS id, placename AS name, terrain, latitude AS lat, longitude AS lng, altitude AS alt, placename AS name, message_type AS type, timestamp AS time, weather_symbol AS weather, temperature AS temp, precipitation AS precip, wind, wind_speed, wind_direction AS wind_dir FROM spot WHERE feed_id='" + feed_id + "' AND altitude IS NOT NULL " + (id ? 'AND cartodb_id > ' + id : '') + " ORDER BY timestamp", function(data) {
                //console.log(data);
                if (data.rows.length) {
                    id = data.rows[data.rows.length - 1].id;
                    elevation.addData(data.rows);
                }
            });
        }, update * 60000);    
    });


    var instagram = L.instagram.cluster({
        featureGroup: L.instagram.fancybox
    }).addTo(map); 

    //var instaUrl = 'http://turban.cartodb.com/api/v2/sql?q=SELECT * FROM instagram WHERE timestamp > ' + timestamp + ' ORDER BY cartodb_id';

    $.getJSON('http://turban.cartodb.com/api/v2/sql?q=SELECT * FROM instagram WHERE cartodb_id >= ' + cartodb_id + ' ORDER BY cartodb_id', function(data) {
        instagram._onLoad(data);
        var id = data.rows[0].cartodb_id;

        setInterval(function(){
            var url = "http://turban.cartodb.com/api/v2/sql?q=SELECT * FROM instagram WHERE cartodb_id > " + id + " ORDER BY cartodb_id";
            $.getJSON(url, function(data) {
                id = data.rows[0].cartodb_id;
                instagram._onLoad(data);
            });
        }, update * 60000);    
    });

//});


$(function () { 
    $('#splitter').split({
        orientation: 'horizontal', 
        limit: 100, 
        position: '70%',
        onDrag: function() {
            //console.log("drag");
            map.invalidateSize();
            elevation.reflow();
        }
    });
});


function instastrip (images) {
    //console.log("insta", images);

    // #elevation

    $.each(images, function(index, image) {
      //console.log(image.image_standard);

      $('#elevation').prepend('<img src="' + image.image_standard + '" height="100%">');
    });
}

function getPlace (data) {
    if (data.name) {
        return L.Util.template('<p><strong>{name}</strong><br>{terrain} {alt} moh.</p>', data);
    }
    return '';
}

function getTime (timestamp) {
    var t = new Date(timestamp * 1000);
    return L.Util.template('<p>{date}. {month} {year} kl. {hours}:{minutes}</p>', {
        date: t.getDate(),
        month: ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'][t.getMonth()],
        year: t.getFullYear(),
        hours: t.getHours(),
        minutes: ('0' + t.getMinutes()).slice(-2)
    });
}

function getWeather (data) {
    if (data.weather) {
        return L.Util.template('<p><img src="http://api.yr.no/weatherapi/weathericon/1.1/?symbol={weather};content_type=image/png" width="38" height="38" style="float:left;margin:-5px 5px 10px -5px;">{temp}°C - {precip} mm<br>{wind},<br>{wind_speed} m/s fra {direction}</p><p>Værdata fra <a href="http://api.yr.no">api.yr.no</a></p>', L.extend(data, {
            direction: { 
                'N':  'nord', 
                'NE': 'nordøst', 
                'E':  'øst', 
                'SE': 'sørøst',
                'S':  'sør', 
                'SW': 'sørvest',
                'W':  'vest',
                'NW': 'nordvest' 
            }[data.wind_dir] || ''
        }));
    }
    return '';
}

