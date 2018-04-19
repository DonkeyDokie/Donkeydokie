<?php
  /*
  POST fields needed from front end:
	email
	password
  */
include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);
  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $post_email = $_POST['email'];
  $post_password = $_POST['password'];

  // $post_email = 'hanfeil2@illinois.edu';
  // $post_password = '12345';

  $sql = "SELECT * FROM User WHERE Email = '".$post_email."'";

  $result = $conn->query($sql);

  if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
    $password = $row['Password'];
    if ($post_password === $password) {
      $resp = [
        'status' => 'success',
        'data' => [
          'login_name' => $row['LoginName'],
          'remarks' => $row['Remarks'],
          'name' => $row['Name'],
          'email' => $row['Email'],
          'user_id' => $row['UserID']
        ]
      ];

      // Calculate cookie for user
      $session_key = hash('sha256', $row['Email']);
      $expire_time = time() + (7* 24 * 60 * 60);
      $sql = "UPDATE User SET SessionKey ='".$session_key."', ExpireTime = FROM_UNIXTIME('".$expire_time."') WHERE UserID=".$row['UserID'];
      if ($conn->query($sql) === TRUE) {
        header('Session-Key:'.$session_key);
        header('Expiration-Time:'.$expire_time);
        $resp['data']['cookie'] = [
          'id' => $row['UserID'],
          'key' => $session_key,
          'expires' => $expire_time
        ];
      }

    } else {
      $resp = [
        'status' => 'fail',
        'message' => 'Incorrect email/password.'
      ];
    }
  } else {
    $resp = [
      'status' => 'fail',
      'message' => 'Cannot find '.$post_email
    ];
  }

  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
