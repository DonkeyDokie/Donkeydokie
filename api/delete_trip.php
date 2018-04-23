
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
  $sql = "SELECT ImgUrl FROM Trips WHERE TripID = ".$trip_id;
  $result = $conn->query($sql);
  if (!$result) {
    echo 'Could not run query: ' . mysql_error();
    exit;
  }
  $img_url = $result->fetch_assoc()['ImgUrl'];
  if(strpos($img_url, "default") === false) {
    unlink($img_url);
  }

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
  $sql = "DELETE FROM At WHERE TripID=".$trip_id;
  $conn->query($sql);
  $resp = [
    'status' => 'success',
    'message' => 'Delete trip succeeded!'
  ];
  $conn->close();
  // header('Content-Type: application/json');
  echo json_encode($resp);
?>
