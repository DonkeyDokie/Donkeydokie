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

  $user_id = $_POST['user_id'];
  # $user_id = 2;

  $sql = "SELECT * FROM User WHERE UserID = '".$user_id."'";
  
  if ($conn->query($sql)->num_rows === 0) {
    $resp = [
      'status' => 'fail',
      'message' => $user_id.' does not exist.',
    ];
  } else {
      $result = $conn->query($sql);
      $row = $result->fetch_assoc();
      $resp = [
        'status' => 'success',
        'data' => [
          'login_name' => $row['LoginName'],
          'name' => $row['Name'],
          'email' => $row['Email'],
          'user_id' => $row['UserID'],
        ]
      ];
  }   
  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
