<?php
  /*
  POST fields needed from front end:
    null
  */

include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $cookie = $_SERVER['HTTP_COOKIE'];
  $session_key= explode("=", $cookie)[1];

  $resp = [
    'status' => 'success',
    'data' => [
      'open' => [],
      'close' => []
    ]
  ];

  $closed_trips_sql =  "SELECT Trips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
  TripDescription, Trips.Remarks, Requirements, Budget, VisibleAttributes, isOpen, Trips.ImgUrl, Nicename AS Location 
  FROM Trips, TravelStyles, At, Countries, User, Owns
  WHERE User.UserID = Owns.UserID AND User.SessionKey = '".$session_key."' AND Owns.TripID = Trips.TripID AND Trips.isOpen = 0 AND
  Trips.TravelStyleID = TravelStyles.TravelStyleID AND At.TripID = Trips.TripID AND At.LocationID = Countries.ISO
  UNION 
  SELECT DISTINCT Trips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
  TripDescription, Trips.Remarks, Requirements, Budget, VisibleAttributes, isOpen, Trips.ImgUrl, null AS Location 
  FROM Trips, TravelStyles, At, Countries, User, Owns 
  WHERE User.UserID = Owns.UserID AND User.SessionKey = '".$session_key."' AND Owns.TripID = Trips.TripID AND Trips.isOpen = 0 AND
  Trips.TravelStyleID = TravelStyles.TravelStyleID AND Trips.TripID NOT IN 
  (SELECT TripID FROM At)";

  $open_trips_sql =  "SELECT Trips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
  TripDescription, Trips.Remarks, Requirements, Budget, VisibleAttributes, isOpen, Trips.ImgUrl, Nicename AS Location 
  FROM Trips, TravelStyles, At, Countries, User, Owns
  WHERE User.UserID = Owns.UserID AND User.SessionKey = '".$session_key."' AND Owns.TripID = Trips.TripID AND Trips.isOpen = 1 AND
  Trips.TravelStyleID = TravelStyles.TravelStyleID AND At.TripID = Trips.TripID AND At.LocationID = Countries.ISO
  UNION 
  SELECT DISTINCT Trips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
  TripDescription, Trips.Remarks, Requirements, Budget, VisibleAttributes, isOpen, Trips.ImgUrl, null AS Location 
  FROM Trips, TravelStyles, At, Countries, User, Owns 
  WHERE User.UserID = Owns.UserID AND User.SessionKey = '".$session_key."' AND Owns.TripID = Trips.TripID AND Trips.isOpen = 1 AND
  Trips.TravelStyleID = TravelStyles.TravelStyleID AND Trips.TripID NOT IN 
  (SELECT TripID FROM At)";

  $result = $conn->query($closed_trips_sql);
  while ($row = $result->fetch_assoc()) {
	  $participants_sql = "SELECT User.UserID, User.LoginName, User.Name, User.Email, User.ImgUrl FROM User, Participate WHERE User.UserID = Participate.UserID AND Participate.TripID = '".$row['TripID']."' ";
      $participants = $conn->query($participants_sql);
	  $row['participants'] = [];
	  while ($participants_row = $participants->fetch_assoc()) {
	      array_push($row['participants'], $participants_row);
	  }
      array_push($resp['data']['close'], $row);
  }

  $result = $conn->query($open_trips_sql);
  while ($row = $result->fetch_assoc()) {
	  $participants_sql = "SELECT User.UserID, User.LoginName, User.Name, User.Email, User.ImgUrl FROM User, Participate WHERE User.UserID = Participate.UserID AND Participate.TripID = '".$row['TripID']."' ";
    $participants = $conn->query($participants_sql);
	  $row['participants'] = [];
	  while ($participants_row = $participants->fetch_assoc()) {
	    array_push($row['participants'], $participants_row);
	  }
    array_push($resp['data']['open'], $row);
  }

  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
