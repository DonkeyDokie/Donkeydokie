
<?php
  /*
  POST fields needed from front end:
    user_id, trip_id
  */

include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $trip_id = $_POST['tripID'];
//   $trip_id = $_POST['trip_id'];
  $sql = "DELETE FROM Trips WHERE TripID = ".$trip_id;
  $conn->query($sql);
  $sql = "DELETE FROM PublicTrips WHERE TripID = ".$trip_id;
  $conn->query($sql);
  $sql = "DELETE FROM PrivateTrips WHERE TripID = ".$trip_id;
  $conn->query($sql);
  $sql = "DELETE FROM ClosedTrips WHERE TripID = ".$trip_id;
  $conn->query($sql);
  $sql = "DELETE FROM OpenTrips WHERE TripID = ".$trip_id;
  $conn->query($sql);
  $sql = "DELETE FROM Owns WHERE TripID = ".$trip_id;
  $conn->query($sql);
  $sql = "DELETE FROM Participate WHERE TripID=".$trip_id;
  $conn->query($sql);
  $sql = "DELETE FROM Applies WHERE TripID=".$trip_id;
  $conn->query($sql);

  $resp = [
    'status' => 'success',
  ];
  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
