<?php
  /*
  POST fields needed from front end:
	user_id
  */

include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $cookie = $_SERVER['HTTP_COOKIE'];
  $session_key= explode("=", $cookie)[1];

  $today_date_str = $_POST['today_date'];

  $sql =  "SELECT Trips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
          TripDescription, Trips.Remarks, Requirements, Budget, VisibleAttributes, isOpen, Trips.ImgUrl, Nicename AS Location 
          FROM Trips, TravelStyles, At, Countries, User, Participate 
          WHERE User.UserID = Participate.UserID AND User.SessionKey = '".$session_key."' AND Participate.TripID = Trips.TripID AND 
          Trips.TravelStyleID = TravelStyles.TravelStyleID AND At.TripID = Trips.TripID AND At.LocationID = Countries.ISO
          UNION 
          SELECT DISTINCT Trips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
          TripDescription, Trips.Remarks, Requirements, Budget, VisibleAttributes, isOpen, Trips.ImgUrl, null AS Location 
          FROM Trips, TravelStyles, At, Countries, User, Participate 
          WHERE User.UserID = Participate.UserID AND User.SessionKey = '".$session_key."' AND Participate.TripID = Trips.TripID AND 
          Trips.TravelStyleID = TravelStyles.TravelStyleID AND Trips.TripID NOT IN 
          (SELECT TripID FROM At)";

  $result = $conn->query($sql);
  $resp = [
    'status' => 'success',
    'data' => [
      'future' => [],
      'current' => [],
      'past' => []
    ]
  ];

  $today_date = strtotime($today_date_str);
  while ($row = $result->fetch_assoc()) {
	  $participants_sql = "SELECT User.UserID, User.LoginName, User.Name, User.Email, User.ImgUrl FROM User, Participate WHERE User.UserID = Participate.UserID AND Participate.TripID = '".$row['TripID']."'";
    $participants = $conn->query($participants_sql);
	  $row['participants'] = [];
	  while ($participants_row = $participants->fetch_assoc()) {
	    array_push($row['participants'], $participants_row);
	  }
    $trip_length = $row["Length"];
    $trip_start_date_str = $row['StartDate'];
    $trip_start_date = strtotime($trip_start_date_str);
    $trip_end_date_fml = $trip_start_date_str . " +" . ($trip_length - 1). " days";
    $trip_end_date = strtotime($trip_end_date_fml);
    $trip_end_date_str = date("Y-m-d", $trip_end_date); 
    if($today_date < $trip_start_date) {
      array_push($resp['data']['future'], $row);
    }else if($today_date <= $trip_end_date) {
      array_push($resp['data']['current'], $row);
    }else{
      array_push($resp['data']['past'], $row);
    }
  }
  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
