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

  $sql = "SELECT * FROM Skills, HasSkill WHERE UserID = '".$user_id."' AND Skills.SkillID = HasSkill.SkillID";
  
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
