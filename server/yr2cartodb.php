<?php

// http://api.yr.no/weatherapi/locationforecast/1.9/?lat=59.33896;lon=5.96669
// http://api.yr.no/weatherapi/locationforecast/1.9/documentation
// http://nrkbeta.no/2014/06/03/bedre-nedborsvarsling-pa-yr/
// http://om.yr.no/forklaring/symbol/

require_once 'cartodb.class.php';
require_once 'config.php';

date_default_timezone_set($timezone);

$cartodb = new CartoDBClient($cartodb_config);

if (!$cartodb->authorized) {
  error_log("uauth");
  print 'There is a problem authenticating, check the key and secret.';
  exit();
}

$lastHour = time() - 3600;
//$lastHour = time() - 3600 * 24;
$response = $cartodb->runSql("SELECT cartodb_id, timestamp, latitude, longitude FROM spot WHERE weather_symbol IS NULL AND timestamp > $lastHour ORDER BY timestamp DESC "); 
//$response = $cartodb->runSql("SELECT cartodb_id, timestamp, latitude, longitude FROM spot WHERE weather_symbol IS NULL AND timestamp > $lastHour ORDER BY timestamp DESC LIMIT 1");

//xprint_r($response);

foreach ($response['return']['rows'] as $row) {
	$cartodb_id = $row->cartodb_id;
	$timestamp  = $row->timestamp;	
	$latitude   = $row->latitude;
	$longitude  = $row->longitude;
	$url        = "http://api.yr.no/weatherapi/locationforecast/1.9/?lat=$latitude;lon=$longitude";
	$xml        = simplexml_load_file($url);
	$time       = date("Y-m-d\TH:i:s\Z", round($timestamp / 3600) * 3600); // Nearest hour
	$hour       = (int)date("G", $timestamp);
	$symbolTime = date("Y-m-d\TH:00:00\Z", $timestamp); // This hour

	//$location   = $xml->xpath("/weatherdata/product/time[@from='$time']/location")[0];
	$location   = $xml->xpath("/weatherdata/product/time[@from='$time']/location");

	if (count($location)) {
		$location      = $location[0];
		$temperature   = (int)$location->temperature['value'];
		$windDirection = (string)$location->windDirection['name'];
		$windSpeed     = (int)$location->windSpeed['mps'];
		$wind          = (string)$location->windSpeed['name'];
		//$cloudiness  = (int)$location ->cloudiness['percent'];
		//$fog         = (int)$location ->fog['percent'];
		$forecast      = $xml->xpath("/weatherdata/product/time[@from='$symbolTime'][2]")[0];
		$symbolTime    = array('from' => (string)$forecast['from'], 'to' => (string)$forecast['to']);
		$symbol        = (int)$forecast->location->symbol['number']; 
		$precipitation = $forecast->location->precipitation['value']; 

		$time          = new DateTIME('now', new DateTimeZone($timezone));
		$sunrise       = strtotime(date_sunrise($time->getTimestamp(), SUNFUNCS_RET_STRING, $latitude , $longitude, 90, $time->getOffset() / 3600));
		$sunset        = strtotime(date_sunset($time->getTimestamp(), SUNFUNCS_RET_STRING, $latitude , $longitude, 90, $time->getOffset() / 3600));

		if ($symbol < 9 && $symbol !== 4) $symbol .= ($timestamp > $sunrise and $timestamp < $sunset) ? 'd' : 'n';
		if (strlen($symbol) < 9) $symbol = "0$symbol";

		/*
		echo '<p>Time: ' . date("Y-m-d\TH:i:s\Z", $timestamp);
		echo '<p>Nearest: ' . $time;
		echo '<p>Temperature: ' . $temperature;
		echo '<p>Wind: ' . $wind;
		echo '<p>Wind speed: ' . $windSpeed;
		echo '<p>Wind direction: ' . $windDirection;
		echo '<p>Precipitation: ' . $precipitation;
		echo "<p>Hour: $hour</p>";
		echo "<p>Symbol: $symbol</p>";
		echo '<img src="http://fil.nrk.no/yr/grafikk/sym/b38/' . $symbol . '.png" width="38" height="38" alt="Klårvêr">';
		*/

		$cartodb->runSql("UPDATE spot SET temperature=$temperature, precipitation=$precipitation, wind='$wind', wind_speed=$windSpeed, wind_direction='$windDirection', weather_symbol='$symbol' WHERE cartodb_id = $cartodb_id");
	}

}

?>

