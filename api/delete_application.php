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

  $trip_id = $_POST['trip_id'];
  $user_id = $_POST['user_id'];
  $sql = "DELETE FROM Applies WHERE TripID = ".$trip_id." AND UserID=".$user_id."";
  $conn->query($sql);

  $resp = [
    'status' => 'success',
  ];
  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
