<?php
  /*
  Input: Null
  Output: all public records
  */
  include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);
  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

$user_id = $_POST['user_id'];

$sql1 =  "SELECT DISTINCT PublicTrips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
        TripDescription, Remarks, Requirements, Budget, VisibleAttributes, isOpen, ImgUrl, Nicename AS Location 
        FROM PublicTrips, TravelStyles, At, Countries
        WHERE PublicTrips.TravelStyleID = TravelStyles.TravelStyleID AND At.TripID = PublicTrips.TripID AND At.LocationID = Countries.ISO
        AND isOpen = 1
        AND PublicTrips.TripID NOT IN 
        (SELECT DISTINCT TripID FROM Owns WHERE Owns.UserID = '".$user_id."')
        AND PublicTrips.TripID NOT IN 
        (SELECT DISTINCT TripID FROM Applies WHERE Applies.UserID = '".$user_id."')";

  $result1 = $conn->query($sql1);


$sql2 =  "SELECT DISTINCT PublicTrips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
        TripDescription, Remarks, Requirements, Budget, VisibleAttributes, isOpen, ImgUrl, Nicename AS Location 
        FROM PublicTrips, TravelStyles, At, Countries
        WHERE PublicTrips.TravelStyleID = TravelStyles.TravelStyleID AND At.TripID = PublicTrips.TripID AND At.LocationID = Countries.ISO
        AND (isOpen = 0
        OR (PublicTrips.TripID IN 
        (SELECT DISTINCT TripID FROM Owns WHERE Owns.UserID = '".$user_id."')
        OR PublicTrips.TripID IN 
        (SELECT DISTINCT TripID FROM Applies WHERE Applies.UserID = '".$user_id."')))";

$result2 = $conn->query($sql2);

  if (!$result1 || !$result2) {
    $resp = [
      'status' => 'fail',
      'message' => 'Error: '.$conn->error
    ];
  } else {
    $resp = [
      'status' => 'success',
      'data' => [
        'acceptable' => [],
        'unAcceptable' => []
      ]
    ];
    while ($row = $result1->fetch_assoc()) {
      array_push($resp['data']['acceptable'], $row);
    }
    while ($row = $result2->fetch_assoc()) {
      array_push($resp['data']['unAcceptable'], $row);
    }
  }

  // header('Content-Type: application/json');
  echo json_encode($resp);
  $conn->close();
?>