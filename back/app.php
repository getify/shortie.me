<?php

$input = file_get_contents("php://stdin");
$REQUEST = @json_decode($input);

$output = false;
$error_output = false;

$reserved_slugs = array();

if ($REQUEST) {
	require_once($REQUEST->DOCUMENT_ROOT."/../dbdefines.php");
	$SHDB = mysql_connect(DB_SERVER,DB_USER,DB_PASS,true);
	mysql_select_db(DB_NAME,$SHDB);

	if (isset($REQUEST->SESSION_ID) && isset($REQUEST->SESSION_NAME)) {
		session_name($REQUEST->SESSION_NAME);
		session_id($REQUEST->SESSION_ID);
	}
	else {
		session_name("PHPSESSIONSROCK");
		session_id(md5(mt_rand().time()));
	}
	session_start();
	$SESSION_CONFIG = array("SESSION_FORCE" => false, "SESSION_ID" => session_id(), "SESSION_NAME" => session_name());
	
	// *********************************************************************************

	$output = array();
	$start = 0;

	if (isset($REQUEST->APP_RESULTS_START)) {
		$start = (int)($REQUEST->RESULTS_START);
		$output["APP_RESULTS_START"] = $start;
	}
	
	if ($REQUEST->RELATIVE_REQUEST_PATH == "/") {
		$output["APP_STATE"] = "index";
		$output["APP_DATA"] = $output["APP_DATA"] || array();
		
		require_once($REQUEST->DOCUMENT_ROOT."/back/results.php");
		
		$results = get_recent_results($start);
		if ($results) {
			$output["APP_DATA"]["result_set"] = $results;
		}
	}
	else if ($REQUEST->RELATIVE_REQUEST_PATH == "/shortenurl") {
		$orig_url = "";
		
		if (isset($REQUEST->GET) && isset($REQUEST->GET->orig_url)) {
			$orig_url = $REQUEST->GET->orig_url;
		}
		else if (isset($REQUEST->POST) && isset($REQUEST->POST->orig_url)) {
			$orig_url = $REQUEST->POST->orig_url;
		}
	
		if ($orig_url) {
			if (!$REQUEST->__INVALIDATED__ || !in_array("orig_url",$REQUEST->__INVALIDATED__)) {
				$shortened_url = null;
				
				// trying to cut down on link spam
				if (preg_match("/xserv1\.umb\.edu/",$orig_url)) {
					$error_output = array("APP_STATE" => "error", "ERROR" => "input_error", "ERROR_DATA" => array("orig_url" => $orig_url));
				}
				else {
					require_once($REQUEST->DOCUMENT_ROOT."/back/shorten.php");
					require_once($REQUEST->DOCUMENT_ROOT."/back/results.php");
		
					@mysql_query("LOCK TABLES shortened WRITE",$SHDB);			
					$slug = generate_slug();
					
					$query = sprintf("INSERT INTO shortened (orig_url,slug) VALUES('%s','%s')",mysql_escape_string($orig_url),$slug);
					$result = mysql_query($query,$SHDB);
					
					if ($result && mysql_affected_rows($SHDB) > 0) {
						$output["APP_DATA"] = $output["APP_DATA"] || array();
						$output["APP_STATE"] = "shortened_url";
						$output["APP_DATA"] = array("orig_url" => $orig_url, "shortened_url_slug" => $slug);
						$parts = parse_url($orig_url);
						if ($parts && $parts["host"]) {
							$output["APP_DATA"]["orig_url_domain"] = $parts["host"];
						}
						
						$results = get_recent_results($start);
						if ($results) {
							$output["APP_DATA"]["result_set"] = $results;
						}
					}
					else {
						$error_output = array("APP_STATE" => "error", "ERROR" => "internal_error", "ERROR_DATA" => array("orig_url" => $orig_url));
					}
					
					@mysql_query("UNLOCK TABLES",$SHDB);
				}
			}
			else {
				$error_output = array("APP_STATE" => "error", "ERROR" => "input_error", "ERROR_DATA" => array("orig_url" => $orig_url));
			}
		}
		else {
			$error_output = array("APP_STATE" => "error", "ERROR" => "internal_error", "ERROR_DATA" => array());
		}
	}
	else if (preg_match("/^\/!([a-z0-9]{3,})/i",$REQUEST->RELATIVE_REQUEST_PATH,$matches)) {
		$slug = $matches[1];
		
		$query = sprintf("SELECT orig_url FROM shortened WHERE enabled = 'yes' AND slug = '%s'",$slug);
		$result = mysql_query($query,$SHDB);
		
		if ($result && mysql_num_rows($result) > 0) {
			list($redirect) = mysql_fetch_row($result);
			
			$output["APP_STATE"] = "external_redirect";
			$output["EXTERNAL_REDIRECT_URL"] = $redirect;
		}
		else {
			$error_output = array("APP_STATE" => "error", "ERROR" => "redirect_error", "ERROR_DATA" => array());
		}
	}
	
}


if (!is_array($output) && !is_array($error_output)) {
	$error_output = array("APP_STATE" => "error", "ERROR" => "internal_error", "ERROR_DATA" => array());
}

if (!empty($error_output)) {
	echo json_encode(array_merge($error_output,$SESSION_CONFIG));
}
else {
	echo json_encode(array_merge($output,$SESSION_CONFIG));
}

?>