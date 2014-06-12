<?php

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
$response = $cartodb->runSql("SELECT cartodb_id, timestamp, latitude, longitude FROM spot WHERE weather_symbol IS NULL AND timestamp > $lastHour ORDER BY timestamp DESC"); 

foreach ($response['return']['rows'] as $row) {
	$cartodb_id = $row->cartodb_id;
	$timestamp  = $row->timestamp;	
	$latitude   = $row->latitude;
	$longitude  = $row->longitude;
	$url        = "http://api.yr.no/weatherapi/locationforecast/1.9/?lat=$latitude;lon=$longitude";
	$xml        = simplexml_load_file($url);
	$time       = date("Y-m-d\TH:i:s\Z", round($timestamp / 3600) * 3600); // Nearest hour
	$symbolTime = date("Y-m-d\TH:00:00\Z", $timestamp); // This hour
	$location   = $xml->xpath("/weatherdata/product/time[@from='$time']/location")[0];

	if (count($location)) {
		$location      = $location[0];
		$temperature   = (int)$location->temperature['value'];
		$windDirection = (string)$location->windDirection['name'];
		$windSpeed     = (int)$location->windSpeed['mps'];
		$wind          = (string)$location->windSpeed['name'];
		$forecast      = $xml->xpath("/weatherdata/product/time[@from='$symbolTime'][2]")[0];
		$symbolTime    = array('from' => (string)$forecast['from'], 'to' => (string)$forecast['to']);
		$symbol        = (int)$forecast->location->symbol['number']; 
		$precipitation = $forecast->location->precipitation['value']; 
		//$time          = new DateTIME('now', new DateTimeZone($timezone));
		//$sunrise       = strtotime(date_sunrise($time->getTimestamp(), SUNFUNCS_RET_STRING, $latitude , $longitude, 90, $time->getOffset() / 3600));
		//$sunset        = strtotime(date_sunset($time->getTimestamp(), SUNFUNCS_RET_STRING, $latitude , $longitude, 90, $time->getOffset() / 3600));

		if (strlen($symbol) < 2) { 
			$symbol = "0$symbol";
		}
		//if ($symbol < 9 && $symbol !== 4) {
		//	$symbol .= ($timestamp > $sunrise and $timestamp < $sunset) ? 'd' : 'n';
		//}

		$cartodb->runSql("UPDATE spot SET temperature=$temperature, precipitation=$precipitation, wind='$wind', wind_speed=$windSpeed, wind_direction='$windDirection', weather_symbol='$symbol' WHERE cartodb_id = $cartodb_id");
	}
}

?>

