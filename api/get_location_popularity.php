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

  $sql = "SELECT DISTINCT COUNT(Trips.TripID) AS count, LocationID AS Nation FROM Trips, At WHERE Trips.TripID = At.TripID GROUP BY At.LocationID";
  
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
