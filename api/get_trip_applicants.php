<?php
  /*
  POST fields needed from front end:
    trip_id
    user_id
  */

include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $trip_id = $_POST['trip_id'];
  //$user_id = $_POST['user_id'];
  $cookie = $_SERVER['HTTP_COOKIE'];
  $session_key= explode("=", $cookie)[1];

  #$sql = "SELECT Name, Email, Message, Title FROM Applies, User, Trips WHERE Applies.TripID = ".$trip_id." AND Trips.TripID = ".$trip_id." AND Applies.UserID = User.UserID";
  // $sql ="SELECT * FROM User WHERE User.UserID = ".$user_id." AND User.SessionKey = '".$session_key."'";
  // $result = $conn->query($sql);
  // if ($result->num_rows === 0) {
    $sql = "SELECT Applies.TripID, User.UserID, Name, Email, Message FROM Applies, User WHERE Applies.TripID = ".$trip_id." AND Applies.UserID = User.UserID AND Applies.ApplyStatus='Pending'";
    $result = $conn->query($sql);
    $sql = "SELECT Title FROM Trips WHERE TripID = ".$trip_id;
    $title_result = $conn->query($sql)->fetch_assoc();
    $resp = [
      'status' => 'success',
      'title' => $title_result['Title'],
      'data' => []
    ];
    while ($row = $result->fetch_assoc()) {
        array_push($resp['data'], $row);
    }
  // }
  // else {
  //   $resp = [
  //     'status' => 'failed'
  //   ];
  // }

  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
