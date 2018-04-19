<?php

include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $resp = [
    'status' => 'success',
    'online' => [],
    'offline' => []
  ];

  // get online users
  $sql = "SELECT * FROM User WHERE UserID IN (SELECT * FROM OnlineStatus)";

  $result = $conn->query($sql);
  while ($row = $result->fetch_assoc()) {
      array_push($resp['online'], $row);
  }

  // get offline users
  $sql = "SELECT * FROM User WHERE UserID NOT IN (SELECT * FROM OnlineStatus)";
  
  $result = $conn->query($sql);
  while ($row = $result->fetch_assoc()) {
      array_push($resp['offline'], $row);
  }

  $conn->close();
  header('Content-Type: application/json');
  echo json_encode($resp);
?>
