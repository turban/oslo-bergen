<?php

date_default_timezone_set('Europe/Oslo');

// http://api.yr.no/weatherapi/locationforecast/1.9/?lat=59.33896;lon=5.96669
// http://api.yr.no/weatherapi/locationforecast/1.9/documentation
// http://nrkbeta.no/2014/06/03/bedre-nedborsvarsling-pa-yr/
// http://om.yr.no/forklaring/symbol/

$timestamp     = time();
$latitude      = 59.33896;
$longitude     = 5.96669;

$url           = "http://api.yr.no/weatherapi/locationforecast/1.9/?lat=$latitude;lon=$longitude";

echo $url;

$xml           = simplexml_load_file($url);
$time          = date("Y-m-d\TH:i:s\Z", round($timestamp / 3600) * 3600); // Nearest hour
$hour          = (int)date("G", $timestamp);
$symbolTime    = date("Y-m-d\TH:00:00\Z", $timestamp); // This hour
$location      = $xml->xpath("/weatherdata/product/time[@from='$time']/location")[0];
$altitude      = (int)$location ['altitude'][0];
$temperature   = (int)$location ->temperature['value'];
$windDirection = (string)$location ->windDirection['name'];
$windSpeed     = (int)$location ->windSpeed['mps'];
$wind          = (string)$location ->windSpeed['name'];
$cloudiness    = (int)$location ->cloudiness['percent'];
$fog           = (int)$location ->fog['percent'];
$forecast      = $xml->xpath("/weatherdata/product/time[@from='$symbolTime'][2]")[0];
$symbolTime    = array('from' => (string)$forecast['from'], 'to' => (string)$forecast['to']);
$symbol        = $forecast->location->symbol['number']; 
$precipitation = $forecast->location->precipitation['value']; 



echo '<p>Time: ' . date("Y-m-d\TH:i:s\Z", $timestamp);
echo '<p>Nearest: ' . $time;
echo '<p>Altitude: ' . $altitude;
echo '<p>Temperature: ' . $temperature;
echo '<p>Wind: ' . $wind;
echo '<p>Wind speed: ' . $windSpeed;
echo '<p>Wind direction: ' . $windDirection;
echo '<p>Cloudiness: ' . $cloudiness;
echo '<p>Fog: ' . $fog;
echo '<p>Precipitation: ' . $precipitation;

//echo '<p>Symbol: ' . $symbolTime;

echo "<p>Hour: $hour</p>";




if ($symbol < 9 && $symbol !== 4) $symbol .= ($hour >= 6 and $hour <= 21) ? 'd' : 'n';
if (strlen($symbol) < 9) $symbol = "0$symbol";

echo "<p>Symbol: $symbol</p>";

echo '<img src="http://fil.nrk.no/yr/grafikk/sym/b38/' . $symbol . '.png" width="38" height="38" alt="Klårvêr">';

?>

