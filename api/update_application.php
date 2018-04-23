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
  $status = $_POST['status'];

  $sql = "UPDATE Applies SET ApplyStatus='".$status."' WHERE TripID = ".$trip_id." AND UserID=".$user_id."";
  $conn->query($sql);

  if ($status == "Approved"){
    $sql = "INSERT INTO Participate(UserID, TripID) VALUES (".$user_id. ", ".$trip_id.")";
    $conn->query($sql);
  }

  $conn->query($sql);

  $resp = [
    'status' => 'success',
    'message' => 'Update application succeed!'
  ];
  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
