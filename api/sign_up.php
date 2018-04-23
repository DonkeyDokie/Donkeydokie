<?php
  /*
  POST fields needed from front end:
	login_name
	name
	remarks
	password
	confirmed_password
	email
  */

include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $login_name= $_POST['login_name'];
  $password = $_POST['password'];
  $confirmed_password = $_POST['confirmed_password'];
  $email = $_POST['email'];
  $img = $_POST['imgUrl'];

  if ($password !== $confirmed_password) {
    $resp = [
      'status' => 'fail',
      'message' => 'Passwords do not match!'
    ];
  } else {
    $stmt = $conn->prepare("SELECT * FROM User WHERE Email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows !== 0) {
      $resp = [
        'status' => 'fail',
        'message' => $email.' has already been registered.',
        'data' => [
          'login_name' => $login_name,
          'email' => $email
        ]
      ];
    } else {

      $stmt = $conn->prepare("INSERT INTO User (LoginName, Password, Email, ImgUrl) VALUES (?,?,?,?)");
      $stmt->bind_param("ssss", $login_name, $password, $email, $img);

      if ($stmt->execute() === TRUE) {
        $stmt = $conn->prepare("SELECT * FROM User WHERE Email=?");
        $stmt->bind_param("s", $email);
        $stmt->execute(); 
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        $session_key = hash('sha256', $row['Email']);
        $expire_time = time() + (7* 24 * 60 * 60);

        $sql = "UPDATE User SET SessionKey ='".$session_key."', ExpireTime = FROM_UNIXTIME('".$expire_time."') WHERE UserID=".$row['UserID'];
        
        if ($conn->query($sql) === TRUE) {
          header('Session-Key:'.$session_key);
          header('Expiration-Time:'.$expire_time);
        } 
        $resp = [
          'status' => 'success',
          'message' => 'Sign up succeed!',
          'data' => [
            'login_name' => $login_name,
            'email' => $email,
            'user_id' => $row['UserID'],
            'img' => $img,
          ]
        ];
      } else {
        $resp = [
          'status' => 'fail',
          'message' => 'Error: '.$conn->error
        ];
      }
    }
  }
  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
