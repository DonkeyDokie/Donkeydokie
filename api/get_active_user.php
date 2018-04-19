<?php
  /*
  POST fields needed from front end:
  all attribute of Trips
  */

  include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $start_date = DateTime::createFromFormat('m/d/Y', $start_day);
  
  $sql = "SELECT UserID FROM Participate UNION SELECT UserID FROM Owns Union SELECT UserID FROM Applies";

  $result = $conn->query($sql);

  if (!$result) {
    $resp = [
      'status' => 'fail',
      'message' => 'Error: '.$conn->error
    ];
  } else {
    $resp = [
      'status' => 'success',
      'data' => []
    ];
    while ($row = $result->fetch_assoc()) {
      array_push($resp['data'], $row);
    }
  }

  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
