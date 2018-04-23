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

  $cookie = $_SERVER['HTTP_COOKIE'];
  $session_key= explode("=", $cookie)[1];

  $sql = "SELECT * FROM User WHERE SessionKey = '".$session_key."'";

  $result = $conn->query($sql);

  if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
    $resp = [
        'status' => 'success',
        'data' => [
          'login_name' => $row['LoginName'],
          'remarks' => $row['Remarks'],
          'name' => $row['Name'],
          'email' => $row['Email'],
          'user_id' => $row['UserID'],
          'img' => $row['ImgUrl']
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
      'message' => 'Cannot find corresponding session key',
    ];
  }

  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
