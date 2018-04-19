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

  $sql = "SELECT * FROM User";
  $result = $conn->query(sql);

  $user_id = $result->num_rows;
  $login_name= $_POST['login_name'];
  $password = $_POST['password'];
  $confirmed_password = $_POST['confirmed_password'];
  $email = $_POST['email'];

  if ($password !== $confirmed_password) {
    $resp = [
      'status' => 'fail',
      'message' => 'Passwords do not match!'
    ];
  } else {
    $sql = "SELECT * FROM User WHERE Email = '".$email."'";

    if ($conn->query($sql)->num_rows !== 0) {
      $resp = [
        'status' => 'fail',
        'message' => $email.' has already been registered.',
        'data' => [
          'login_name' => $login_name,
          'email' => $email,
          'user_id' => $row['UserID'],
        ]
      ];
    } else {

      $value_str = join("', '", [$user_id, $login_name, null, null, $password, $email]);
      $sql = "INSERT INTO User (UserID, LoginName, Name, Remarks, Password, Email) VALUES ('".$value_str."')";

      if ($conn->query($sql) === TRUE) {
        $sql = "SELECT * FROM User WHERE Email = '".$email."'";
        $result = $conn->query($sql);
        $row = $result->fetch_assoc();
        $resp = [
          'status' => 'success',
          'data' => [
            'login_name' => $login_name,
            'email' => $email,
            'user_id' => $row['UserID'],
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
