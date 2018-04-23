<?php
  /*
  POST fields needed from front end:
    trip_id
  */

include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $trip_id = $_POST['trip_id'];
  $cookie = $_SERVER['HTTP_COOKIE'];
  $session_key= explode("=", $cookie)[1];

    $sql = "SELECT Applies.TripID, User.UserID, LoginName, Email, Message FROM Applies, User WHERE Applies.TripID = ".$trip_id." AND Applies.UserID = User.UserID AND Applies.ApplyStatus='Pending'";
    $result = $conn->query($sql);
    $sql = "SELECT Title FROM Trips WHERE TripID = ".$trip_id;
    $title_result = $conn->query($sql)->fetch_assoc();
    $resp = [
      'status' => 'success',
      'title' => $title_result['Title'],
      'trip_id' => $_POST['trip_id'],
      'message' => 'get applications succeed',
      'data' => []
    ];
    while ($row = $result->fetch_assoc()) {
        array_push($resp['data'], $row);
    }

  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
