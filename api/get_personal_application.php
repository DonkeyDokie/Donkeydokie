<?php
  /*
  POST fields needed from front end:
    null
  */

include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  //$user_id = $_POST['user_id'];
  $cookie = $_SERVER['HTTP_COOKIE'];
  $session_key= explode("=", $cookie)[1];

  $sql = "SELECT U1.UserID, U1.LoginName, U1.Name, U1.Email, U2.UserID AS HosterUserID, U2.Name AS HosterName, U2.LoginName AS HosterLoginName, U2.Email AS HosterEmail, Applies.ApplyStatus, Applies.TripID, Applies.ApplyTime, Applies.Message, Trips.Title FROM Applies, User as U1, User as U2, Trips, Owns WHERE U1.UserID = Applies.UserID AND U2.UserID = Owns.UserID AND Owns.TripID = Trips.TripID AND U1.SessionKey = '".$session_key."' AND Applies.TripID = Trips.TripID";
  
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
