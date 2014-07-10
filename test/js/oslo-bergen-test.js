$(function () { 

    var map = L.map('map', {
        maxZoom: 14
    }).setView([59.25, 5.84], 12);

    L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norges_grunnkart&zoom={z}&x={x}&y={y}', {
        attribution: '&copy; <a href="http://kartverket.no/">Kartverket</a>'
    }).addTo(map);

    //var url = "http://turban.cartodb.com/api/v2/sql?q=SELECT latitude AS lat, longitude AS lng, altitude AS alt, placename AS name, message_type AS type, timestamp AS time FROM spot WHERE feed_id='oslo-bergen-test' ORDER BY timestamp";
    var url = "http://turban.cartodb.com/api/v2/sql?q=SELECT latitude AS lat, longitude AS lng, altitude AS alt, placename AS name, message_type AS type, timestamp AS time FROM spot WHERE feed_id='oslo-bergen-test' AND altitude IS NOT NULL AND timestamp < 1400056368 ORDER BY timestamp";

    var elevation = L.elevation('elevation', {
        live: true
    }).addTo(map); 

    elevation.on('markerclick chartclick', function(evt) {
        console.log(evt.type, evt.data);
        evt.marker.bindPopup('Popup').openPopup();
    });

    $.getJSON(url, function(data) {
        elevation.addData(data.rows);
        var id;

        /*
        setInterval(function(){
            var url = "http://turban.cartodb.com/api/v2/sql?q=SELECT cartodb_id AS id, latitude AS lat, longitude AS lng, altitude AS alt, placename AS name, message_type AS type, timestamp AS time FROM spot WHERE feed_id='oslo-bergen-test' AND altitude IS NOT NULL AND timestamp > 1400056368 " + (id ? 'AND cartodb_id > ' + id : '') + " ORDER BY timestamp LIMIT 1";
            $.getJSON(url, function(data) {
                id = data.rows[data.rows.length - 1].id;
                elevation.addData(data.rows);
            });
        }, 0.1 * 60000);    
        */
    });

});

