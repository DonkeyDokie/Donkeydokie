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
  $is_open = $_POST['status'];

  $sql1 = "UPDATE Trips SET isOpen = '".$is_open."' WHERE TripID = '".$trip_id."'";
  $sql2 = "UPDATE PublicTrips SET isOpen = '".$is_open."' WHERE TripID = '".$trip_id."'";

  $conn->query($sql1);
  $conn->query($sql2);

  if ($is_open == 0) {
    $sql3 = "UPDATE Applies SET ApplyStatus='Closed' WHERE TripID = ".$trip_id."";
    $conn->query($sql3);
  } else if ($is_open == 1) {
    $sql3 = "UPDATE Applies SET ApplyStatus='Pending' WHERE TripID = ".$trip_id."";
    $conn->query($sql3);
  }

  $resp = [
    'status' => 'success',
  ];
  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>