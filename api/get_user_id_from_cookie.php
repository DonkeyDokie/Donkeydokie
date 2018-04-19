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

  $cookie = $_SERVER['HTTP_COOKIE'];
  $session_key= explode("=", $cookie)[1];

  $sql = "SELECT * FROM User WHERE User.SessionKey = '".$session_key."'";
  
  $result = $conn->query($sql);
  $row = $result->fetch_assoc();
  $resp = [
    'status' => 'success',
    'data' => [
        'user_id' => $row['UserID'],
        'user_name' => $row['Name'],
        'user_login_name' => $row['LoginName']
    ]
  ];
  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
