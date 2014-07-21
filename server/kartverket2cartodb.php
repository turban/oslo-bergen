<?php

mb_internal_encoding("UTF-8");
mb_http_output("UTF-8");

require_once 'cartodb.class.php';
require_once 'config.php';

$cartodb = new CartoDBClient($cartodb_config);

if (!$cartodb->authorized) {
  error_log("uauth");
  print 'There is a problem authenticating, check the key and secret.';
  exit();
}

$response = $cartodb->runSql("SELECT cartodb_id, latitude, longitude FROM spot WHERE altitude IS NULL ORDER BY timestamp DESC LIMIT 100"); 

foreach ($response['return']['rows'] as $row) {
	$cartodb_id = $row->cartodb_id;
	$latitude   = $row->latitude;
	$longitude  = $row->longitude;
	$url        = "http://openwps.statkart.no/skwms1/wps.elevation?request=Execute&service=WPS&version=1.0.0&identifier=elevation&datainputs=[lat=$latitude;lon=$longitude;epsg=4326]";
	$xml        = simplexml_load_file($url);

	if ($xml->xpath('//wps:ExecuteResponse/wps:ProcessOutputs')) {		
		$output     = $xml->xpath('//wps:ExecuteResponse/wps:ProcessOutputs')[0]; 
		$altitude   = (string)$output->xpath('wps:Output[ows:Identifier/text()="elevation"]/wps:Data/wps:LiteralData')[0];

		if ($altitude !== 'nan') {
			$altitude  = round($altitude);	
			$placename = (string)$output->xpath('wps:Output[ows:Identifier/text()="placename"]/wps:Data/wps:LiteralData')[0];
			$ssrid     = (int)$output->xpath('wps:Output[ows:Identifier/text()="ssrid"]/wps:Data/wps:LiteralData')[0];
			$terrain   = (string)$output->xpath('wps:Output[ows:Identifier/text()="terrain"]/wps:Data/wps:LiteralData')[0];

			$cartodb->runSql("UPDATE spot SET altitude=$altitude, placename='$placename', ssrid=$ssrid, terrain='$terrain' WHERE cartodb_id = $cartodb_id");
			//echo "<p>$placename $ssrid $altitude $terrain";
		}		
	} else {
		echo "<p>Error: " + $url;
	}
}

?>


