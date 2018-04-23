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

  $resp = [
    'status' => 'success',
    'create' => 0,
    'apply' => 0,
    'participate' => 0,
    'travel_style' => [],
    'application' => []
  ];

  // Get user ID
  $sql = "SELECT UserID FROM User WHERE SessionKey = '".$session_key."'";
  $result = $conn->query($sql) or die($conn->error);
  $user_id = $result->fetch_assoc()['UserID'];
 
 
  // Created trips
  $sql = "SELECT * FROM User, Owns WHERE User.UserID = Owns.UserID AND User.SessionKey = '".$session_key."'";
  $result = $conn->query($sql) or die($conn->error);
  $resp['create'] = mysqli_num_rows($result);

  // Applied trips
  $sql = "SELECT * FROM User, Applies WHERE User.UserID = Applies.UserID AND User.SessionKey = '".$session_key."' AND Applies.ApplyStatus = 'Pending'";
  $result = $conn->query($sql) or die($conn->error);
  $resp['apply'] = mysqli_num_rows($result);

  // Participated trips
  $sql = "SELECT * FROM User, Participate WHERE User.UserID = Participate.UserID AND User.SessionKey = '".$session_key."'";
  $result = $conn->query($sql) or die($conn->error);
  $resp['participate'] = mysqli_num_rows($result);

  // Travel Style Statistic

  $sql = "SELECT TravelStyleName, COUNT(TripID) FROM UserAssociatedTrips, TravelStyles 
          WHERE UserID = ".$user_id. " AND UserAssociatedTrips.TravelStyleID = TravelStyles.TravelStyleID
          GROUP BY UserAssociatedTrips.TravelStyleID";

  $result = $conn->query($sql) or die($conn->error);
  while($row = $result->fetch_assoc()) {
    $resp['travel_style'][$row['TravelStyleName']] = $row['COUNT(TripID)'];
  }

  // Application Statistic
  $sql = "SELECT ApplyStatus, COUNT(TripID) FROM Applies WHERE UserID = ".$user_id." GROUP BY ApplyStatus";
  $result = $conn->query($sql) or die($conn->error);
  while($row = $result->fetch_assoc()) {
    $resp['application'][$row['ApplyStatus']] = $row['COUNT(TripID)'];
  }

  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
