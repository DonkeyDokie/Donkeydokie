<?php
  /*
  Input: UserID, TripID
  Output: Null
  */
  include '../credentials/credentials.php';
  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);
  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }

  $user_id = $_POST['userID'];
  $trip_id = $_POST['tripID'];
  $message = $_POST['message'];

  // Check if the user has allready applied for this trip.
  $sql = "SELECT * FROM Applies WHERE UserID = '".$user_id."' AND TripID = '".$trip_id."'";
  if ($conn->query($sql)->num_rows !== 0) {
    $resp = [
      'status' => 'fail',
      'message' => 'You have already applied for this trip.',
      'data' => [
        'user_id' => $user_id,
        'trip_id' => $trip_id,
        'message' => $message
      ]
    ];
  } else {
    $apply_status = 'Pending';  // Temp value.
    $stmt = $conn->prepare("INSERT INTO Applies (UserID, TripID, ApplyStatus, ApplyTime, Message) VALUES (?,?,?,?,?)");
    $stmt->bind_param("ddsss", $user_id, $trip_id, $apply_status, date_create('now')->format('Y-m-d H:i:s'), $message);

    if ($stmt->execute() === TRUE) {
      $sql = "SELECT * FROM Applies WHERE UserID = '$user_id' AND TripID = '$trip_id'";
      $result = $conn->query($sql);
      $row = $result->fetch_assoc();
      $resp = [
        'status' => 'success',
        'message' => 'Success! Please wait for the trip owner to review the application.',
        'data' => [
          'user_id' => $row['UserID'],
          'trip_id' => $row['TripID'],
          'apply_status' => $row['ApplyStatus']
        ]
      ];
    } else {
      $resp = [
        'status' => 'fail',
        'message' => 'Error: '.$conn->error  
      ];
    }
  }

  header('Content-Type: application/json');
  echo json_encode($resp);
  $conn->close();
?>
