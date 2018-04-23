<?php

/**
 * user_id
 * travel_style_vec
 * budget_idx
 * travel_len_idx
 */

require_once("get_content_based_recom_func.php");

include '../../credentials/credentials.php';

$conn = new mysqli($server_name, $db_username, $db_password, $db_name);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$user_id = $_POST['user_id'];
// $user_id = 1023;

// Check if this user has already registered.
$sql_user_feat = "SELECT * FROM UserFeature WHERE UserID = '".$user_id."'";
$sql_user_feat_re = $conn->query($sql_user_feat);

if ($sql_user_feat_re->num_rows !== 0) {
    // If registered, get user_feature from database.
    get_content_based_recom($user_id, null, null, null);
} else {
    // Else receive from front-end.
    $travel_style_vec = $_POST['travel_style_vec'];
    $budget_idx = $_POST['budget_idx'];
    $travel_len_idx = $_POST['travel_len_idx'];
    // $travel_style_vec = array(4, 3, 2, 2, 4, 5, 0);
    // $budget_idx = 3;
    // $travel_len_idx = 4;
    get_content_based_recom($user_id, $travel_style_vec, $budget_idx, $travel_len_idx);
}


// require_once("data_preprocess.php");
// require_once("content_based_recommend_alg.php");

// include '../../credentials/credentials.php';

// $conn = new mysqli($server_name, $db_username, $db_password, $db_name);
// if ($conn->connect_error) {
//     die('Connection failed: ' . $conn->connect_error);
// }

// echo "<pre>" . print_r("Running content based recommendation...", 1). "</pre>";

// $user_id = $_POST['user_id'];
// // $user_id = 1000;

// // Check if this user has already registered.
// $sql_user_feat = "SELECT * FROM UserFeature WHERE UserID = '".$user_id."'";
// $sql_user_feat_re = $conn->query($sql_user_feat);

// // Get user feature. 
// if ($sql_user_feat_re->num_rows !== 0) {
//     // If registered, get user_feature from database.
//     $user_feature = array();
//     while ($row = $sql_user_feat_re->fetch_assoc()) {
//         $data = json_decode($row['Feature'], true);
//         $user_feature = $data['feature'];
//     }
// } else {
//     // Else receive from front-end.

//     // $travel_style_vec = $_POST['travel_style_vec'];
//     // $budget_idx = $_POST['budget_idx'];
//     // $travel_len_idx = $_POST['travel_len_idx'];
//     $travel_style_vec = array(1, 3, 0, 2, 4, 5, 0);
//     $budget_idx = 3;
//     $travel_len_idx = 4;

//     // Get feature for a new user.
//     $user_feature = get_single_feature_vec($travel_style_vec, $budget_idx, $travel_len_idx);

//     // Insert into database if user_feature not exist.
//     $user_feature_data = ['feature' => $user_feature];
//     $user_feature_json = json_encode($user_feature_data);

//     $stmt = $conn->prepare("INSERT INTO UserFeature (UserID, Feature) VALUES (?,?)");
//     $stmt->bind_param("is", $user_id, $user_feature_json);
//     if ($stmt->execute() === FALSE) {
//         echo "FAIL!!\n";
//     }
// }
// // echo "<pre>" . print_r($user_feature, 1). "</pre>";


// // Get features for all trips in database.
// $sql = "SELECT TripID, TravelStyleID, Budget, Length FROM PublicTrips";

// $sql_result = $conn->query($sql);
// $all_features = get_all_features($sql_result, null, null);

// // Recommend.
// $cont_based_recom = new contentBasedRecommend();
// $ranks = $cont_based_recom->get_recommendations($all_features, $user_feature);
// // echo "<pre>" . print_r($ranks, 1) . "</pre>";

// // Select trip_id from ranks.
// $top_trips = array_keys($ranks);


// // Return top 10 trips and their info.
// if (count($ranks) > 10) {
//     $top_trips = array_slice($top_trips, 0, 10);
// }
// echo "<pre>" . print_r($top_trips, 1). "</pre>";

// $resp = [
//     'status' => 'success',
//     'data' => []
// ];

// if (count($top_trips) != 0) {
//     for($i = 0; $i < count($top_trips); $i++) {
//         $curr_trip_id = $top_trips[$i];
//         $sql_top_trip_info = "SELECT PublicTrips.TripID, Title, Time, StartDate, Length, TravelStyleName, TravelStyleIcon, 
//                                 TripDescription, PublicTrips.Remarks, Requirements, Budget, VisibleAttributes, isOpen, 
//                                 PublicTrips.ImgUrl, Nicename AS Location 
//                               FROM PublicTrips, TravelStyles, At, Countries 
//                               WHERE PublicTrips.TravelStyleID = TravelStyles.TravelStyleID 
//                                 AND At.TripID = PublicTrips.TripID AND At.LocationID = Countries.ISO 
//                                 AND PublicTrips.TripID = '".$curr_trip_id."'";
//         $sql_top_trip_info_re = $conn->query($sql_top_trip_info);
//         while ($row = $sql_top_trip_info_re->fetch_assoc()) {
//             array_push($resp['data'], $row);
//         }
//     }
// }

// $conn->close();
// echo json_encode($resp);

?>