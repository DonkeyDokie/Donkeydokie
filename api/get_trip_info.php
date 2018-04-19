<?php
  /*
  Input: TripID
  Output: Null
  */
  include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);
  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $trip_id = $_POST['tripID'];

  $sql = "SELECT Trips.TripID, Title, Time, StartDate, Length, TravelStyles.TravelStyleID, TravelStyleName, 
  TripDescription, Remarks, Requirements, Budget, VisibleAttributes, isOpen, imgUrl, Countries.Nicename AS Location 
  FROM Trips, TravelStyles, At, Countries 
  WHERE At.TripID = '".$trip_id."' AND At.LocationID = Countries.ISO AND
  Trips.TripID = '".$trip_id."' AND Trips.TravelStyleID = TravelStyles.TravelStyleID
  UNION
  SELECT DISTINCT Trips.TripID, Title, Time, StartDate, Length, TravelStyles.TravelStyleID, TravelStyleName, 
  TripDescription, Remarks, Requirements, Budget, VisibleAttributes, isOpen, imgUrl, null AS Location 
  FROM Trips, TravelStyles, At
  WHERE Trips.TripID = '".$trip_id."' 
  AND Trips.TravelStyleID = TravelStyles.TravelStyleID AND Trips.TripID NOT IN
  (SELECT TripID FROM At)"
  ;

  $result = $conn->query($sql);

  if (!$result) {
    $resp = [
      'status' => 'fail',
      'message' => 'Error: '.$conn->error
    ];
  } else {
    $resp = [
      'status' => 'success',
      'data' => []
    ];
    while ($row = $result->fetch_assoc()) {
      array_push($resp['data'], $row);
    }
  }

  header('Content-Type: application/json');
  echo json_encode($resp);
  $conn->close();

?>