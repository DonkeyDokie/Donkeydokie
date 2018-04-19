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

$sql =  "SELECT PublicTrips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
        TripDescription, Remarks, Requirements, Budget, VisibleAttributes, isOpen, ImgUrl, Nicename AS Location 
        FROM PublicTrips, TravelStyles, At, Countries
        WHERE PublicTrips.TravelStyleID = TravelStyles.TravelStyleID AND At.TripID = PublicTrips.TripID AND At.LocationID = Countries.ISO
        UNION 
        SELECT DISTINCT PublicTrips.TripID, Title, StartDate, Length, TravelStyleName, TravelStyleIcon, 
        TripDescription, Remarks, Requirements, Budget, VisibleAttributes, isOpen, ImgUrl, null AS Location 
        FROM PublicTrips, TravelStyles, At 
        WHERE PublicTrips.TravelStyleID = TravelStyles.TravelStyleID AND PublicTrips.TripID NOT IN 
        (SELECT TripID FROM At)";

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

  // header('Content-Type: application/json');
  echo json_encode($resp);
  $conn->close();
?>