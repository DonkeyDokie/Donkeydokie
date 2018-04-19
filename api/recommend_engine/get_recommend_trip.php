<?php

require_once("recommend_alg.php");
// require_once("get_trip_scores.php");
// require_once("../get_personal_trip.php");


include '../../credentials/credentials.php';
    $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

    if ($conn->connect_error) {
        die('Connection failed: ' . $conn->connect_error);
    }

//   $user_id = 1;
//   $cookie = $_SERVER['HTTP_COOKIE'];
//   $session_key= explode("=", $cookie)[1];
    $user_trips = array();
    // $tmp_uid = 0;
    // $tmp_tid = 0;
    $score = 5; // hard code a score.

    $sql = "SELECT User.UserID, Trips.TripID FROM Trips, Participate, User, TravelStyles 
            WHERE Participate.UserID = User.UserID AND Participate.TripID = Trips.TripID 
            AND Trips.TravelStyleID = TravelStyles.TravelStyleID";
  
    $result = $conn->query($sql);

    while ($row = $result->fetch_assoc()) {
        $tmp_uid = $row["UserID"];
        $tmp_tid = $row["TripID"];
        if (!array_key_exists($tmp_uid, $user_trips)) {
            $user_trips[$tmp_uid] = array();
        }

        if (!array_key_exists($tmp_tid, $user_trips[$tmp_uid])) {
            $score += 1;  // hardcode different scores
            $user_trips[$tmp_uid][$tmp_tid] = $score;
        }
    }
    $conn->close();

    print_r($user_trips);
    print_r("---------------------");

    $re = new Recommend();
    $results = $re->get_recommendations($user_trips, "2");
    echo(var_dump($results));

    // print_r($results);

    // print_r($user_trips);

    // $trips =  array(                
    //     "hanfeil" => array("trip1" => 2.5, "trip2" => 3.5,
    //                     "trip3" => 3, "trip4" => 4),    
    //     "ziyuz" => array("trip3" => 2.5, "trip5" => 3.5,
    //                     "trip8" => 3),   
    //     "ceguo" => array("trip4" => 5, "trip10" => 3.5,
    //                     "trip8" => 1),    
    //     "yifanh" => array("trip10" => 5, "trip3" => 3.5)    
    // );

    // print("----------------test recom: --------------");
    // $re = new Recommend();
    // $results = $re->get_recommendations($trips, "hanfeil");
    // echo(var_dump($results));


?>