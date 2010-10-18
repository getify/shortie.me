<?php

function get_recent_results($start) {
	global $SHDB;
	$results = array();
	
	$query = sprintf("SELECT orig_url, slug AS 'shortened_url_slug' FROM shortened WHERE enabled = 'yes' ORDER BY id DESC LIMIT %d, 10",$start);
	
	$result = mysql_query($query,$SHDB);
	
	if ($result && mysql_num_rows($result) > 0) {
		while ($row = mysql_fetch_assoc($result)) {
			$results[] = $row;
		}
		return $results;
	}
	return false;
}

?>