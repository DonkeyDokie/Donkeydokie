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

  //$user_id = $_POST['user_id'];
  $cookie = $_SERVER['HTTP_COOKIE'];
  $session_key= explode("=", $cookie)[1];

  $sql =  "SELECT Trips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
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

  $result = $conn->query($sql);
  $resp = [
    'status' => 'success',
    'data' => []
  ];
  while ($row = $result->fetch_assoc()) {
      array_push($resp['data'], $row);
  }
  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
