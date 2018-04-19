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

  $sql = "SELECT COUNT(User.UserID), User.LoginName FROM User, Owns WHERE User.UserID = Owns.UserID GROUP BY User.UserID";
  
  $result = $conn->query($sql) or die($conn->error);
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
