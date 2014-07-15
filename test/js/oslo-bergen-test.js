//$(function () { 

    var bounds = [[59.9, 5.1], [60.9, 11.11]];

    // create an orange rectangle

    var map = L.map('map', {
        maxZoom: 14
    }).fitBounds(bounds);

    L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norges_grunnkart&zoom={z}&x={x}&y={y}', {
        attribution: '&copy; <a href="http://kartverket.no/">Kartverket</a>'
    }).addTo(map);

    //L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);


    //var url = "http://turban.cartodb.com/api/v2/sql?q=SELECT latitude AS lat, longitude AS lng, altitude AS alt, placename AS name, message_type AS type, timestamp AS time FROM spot WHERE feed_id='oslo-bergen-test' ORDER BY timestamp";


    var url = "http://turban.cartodb.com/api/v2/sql?q=SELECT latitude AS lat, longitude AS lng, altitude AS alt, placename AS name, message_type AS type, timestamp AS time FROM spot WHERE feed_id='oslo-bergen-test' AND altitude IS NOT NULL AND timestamp < 1400056368 ORDER BY timestamp";

    var elevation = L.elevation('elevation', {
        live: true,
        chart: {
            xAxis: {
                reversed: true
            }
        }
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


    var instagram = L.instagram.cluster({
        featureGroup: L.instagram.fancybox
    }).addTo(map); 

    var instaUrl = 'http://turban.cartodb.com/api/v2/sql?q=SELECT * FROM instagram ORDER BY cartodb_id LIMIT 10';


    $.getJSON(instaUrl, function(data) {
        instagram._onLoad(data);
        var id = data.rows[0].cartodb_id;


        //instastrip(data.rows);


        /*
        setInterval(function(){
            var url = "http://turban.cartodb.com/api/v2/sql?q=SELECT * FROM instagram WHERE cartodb_id > " + id + " ORDER BY cartodb_id LIMIT 1";
            $.getJSON(url, function(data) {
                id = data.rows[0].cartodb_id;
                instagram._onLoad(data);
            });
        }, 0.1 * 60000);    
        */

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
    console.log("insta", images);

    // #elevation

    $.each(images, function(index, image) {
      console.log(image.image_standard);

      $('#elevation').prepend('<img src="' + image.image_standard + '" height="100%">');
    });


}

