<?php

/**
 * Use content based & collaborative filtering once the user interacts 
 * with some actual trips.
 * 
 * user_id
 */


require_once("user_based_recommend_alg.php");
require_once("data_preprocess.php");
// require_once("../get_personal_trip.php");

include '../../credentials/credentials.php';
$conn = new mysqli($server_name, $db_username, $db_password, $db_name);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

// Get user_id.
$user_id = $_POST['user_id'];

// $cookie = $_SERVER['HTTP_COOKIE'];
// $session_key= explode("=", $cookie)[1];
// $sql_user_id = "SELECT UserID FROM User WHERE SessionKey = '".$session_key."'";
// $sql_user_id_re = $conn->query($sql_user_id);
// $user_id = $sql_user_id_re->fetch_assoc()['UserID'];


// Check if this user is associated with any trips.
// If not, use content based recommendation, else use this user based.
$sql_check = "SELECT UserID, TripID FROM UserAssociatedTrips WHERE UserID = '".$user_id."'";

if ($conn->query($sql_check)->num_rows === 0) {

    require_once("get_content_based_recom_func.php");

    // Must have user feature if this user has registered. Check.
    $sql_user_feat = "SELECT * FROM UserFeature WHERE UserID = '".$user_id."'";
    $sql_user_feat_re = $conn->query($sql_user_feat);
    if ($sql_user_feat_re->num_rows !== 0) {
        get_content_based_recom($user_id, null, null, null);
    } else {
        echo "FAIL!! No user feature!";
    }

} else {

    // Get trips associated with each user.
    $sql_user_trip = "SELECT UserID, TripID FROM UserAssociatedTrips 
                      WHERE TripID IN (SELECT TripID FROM PublicTrips)";  
    $sql_user_trip_re = $conn->query($sql_user_trip);


    // Get all user features.
    // $sql_user_feat = "SELECT Feature FROM UserFeature WHERE UserID = '".$user_id."'";
    $sql_user_feat = "SELECT * FROM UserFeature";
    $sql_user_feat_re = $conn->query($sql_user_feat);
    $all_user_features = array();
    if ($sql_user_feat_re->num_rows !== 0) {
        while ($row = $sql_user_feat_re->fetch_assoc()) {
            $data = json_decode($row['Feature'], true);
            $all_user_features[$row['UserID']] = $data['feature']; 
        }
    }
    // echo "<pre>" . print_r($all_user_features, 1). "</pre>";


    // Get features for all trips in database.
    $sql_trip_info = "SELECT TripID, TravelStyleID, Budget, Length FROM PublicTrips";

    $sql_trip_info_re = $conn->query($sql_trip_info);
    $all_trip_features = get_all_features($sql_trip_info_re, null, null);


    // Get preferences array for every user.
    $user_trips = get_preferences($sql_user_trip_re, $all_user_features, $all_trip_features);
    // echo "<pre>" . print_r($user_trips, 1). "</pre>";


    // Return ranking array: trip_id => score.
    $user_based_recom = new userBasedRecommend();
    $ranking_result = $user_based_recom->get_recommendations($user_trips, $user_id);
    // echo "<pre>" . print_r($ranking_result, 1). "</pre>";

    // Select trip_id from ranks and return trip info.
    $top_trips = array_keys($ranking_result);
    // echo "<pre>" . print_r($top_trips, 1). "</pre>";

    $resp = [
        'status' => 'success',
        'data' => []
    ];

    if (count($top_trips) != 0) {
        for($i = 0; $i < count($top_trips); $i++) {
            $curr_trip_id = $top_trips[$i];
            $sql_top_trip_info = "SELECT PublicTrips.TripID, Title, Time, StartDate, Length, TravelStyleName, TravelStyleIcon, 
                                    TripDescription, PublicTrips.Remarks, Requirements, Budget, VisibleAttributes, isOpen, 
                                    PublicTrips.ImgUrl, Nicename AS Location 
                                FROM PublicTrips, TravelStyles, At, Countries 
                                WHERE PublicTrips.TravelStyleID = TravelStyles.TravelStyleID 
                                    AND At.TripID = PublicTrips.TripID AND At.LocationID = Countries.ISO 
                                    AND PublicTrips.TripID = '".$curr_trip_id."'";
            $sql_top_trip_info_re = $conn->query($sql_top_trip_info);
            while ($row = $sql_top_trip_info_re->fetch_assoc()) {
                array_push($resp['data'], $row);
            }
        }

        echo json_encode($resp);

    } else {
        // If num of top_trips is 0 (or too small), means this user doesn't have any connections with other users.
        // Use content based function instead to at least return something.
        require_once("get_content_based_recom_func.php");

        // Must have user feature if this user has registered. Check.
        $sql_user_feat = "SELECT * FROM UserFeature WHERE UserID = '".$user_id."'";
        $sql_user_feat_re = $conn->query($sql_user_feat);
        if ($sql_user_feat_re->num_rows !== 0) {
            get_content_based_recom($user_id, null, null, null);
        } else {
            echo "FAIL!! No user feature!";
        }
    }


    $conn->close();
    
}



?>