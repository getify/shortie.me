<?php
/*!	Shortie.me URL Shortener (shorten.php)
	(c) Kyle Simpson
	MIT License
*/


function generate_slug() {
	global $SHDB, $reserved_slugs;
	
	$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	$len = 3;
	$count = 0;
	
	$base_query = "SELECT id FROM shortened WHERE slug = '%s'";
	do {
		$count++;
		if ($count == 1000) {
			$len++;
			$count = 0;
		}
		$slug = "";
		for ($i=0; $i<$len; $i++) {
			$slug .= $chars{(mt_rand(0,strlen($chars)-1))};
		}
		
		if (in_array($slug,$reserved_slugs)) {
			continue;
		}
		
		$query = sprintf($base_query,$slug);
		$result = mysql_query($query,$SHDB);
		if (!$result) return null;
	
	} while(mysql_num_rows($result) > 0);
	return $slug;
}

?>