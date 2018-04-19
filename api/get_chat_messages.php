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
  $sender_id = $_POST['sender_id'];

  $resp = [
    'status' => 'success',
    'data' => [],
    'sd' => $sender_id
  ];

  $sql = "SELECT * FROM Message WHERE receiver_id = '".$user_id."' OR (sender_id ='".$user_id."' AND receiver_id <> -1)";

  $result = $conn->query($sql);
  while ($row = $result->fetch_assoc()) {
    array_push($resp['data'], $row);
  }

  if($sender_id != "-1") {
      $sql = "UPDATE Message SET Message.read = '1' WHERE (receiver_id = ".$user_id." AND sender_id = ".$sender_id.") OR (sender_id = ".$user_id." AND receiver_id = ".$sender_id.")";
      $result = $conn->query($sql);
  }

  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
