<?php
  /*

  Input: 
  TripID, 
  Title, 
  Time, 
  StartDate, 
  Length, 
  TravelStyleID, 
  TripDescription, 
  Remarks, 
  Requirements, 
  Budget, 
  VisibleAttributes

  Output: none
  */

  include '../credentials/credentials.php';

  $conn = new mysqli($server_name, $db_username, $db_password, $db_name);
  if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
  }
  
  $sql = "SELECT MAX(TripID)+1 AS id FROM Trips";
  $result = $conn->query($sql) or die($conn->error);
  $data = $result->fetch_assoc();
  $trip_id = $data['id'];

  $title = $_POST['title'];
  $start_day = $_POST['start_day'];
  $length = $_POST['length'];
  $travel_style_id = $_POST['travel_style_id'];
  $travel_description = $_POST['travel_description'];
  $remarks = $_POST['remarks'];
  $requirements = $_POST['requirements'];
  $budget = $_POST['budget'];
  $visible_attributes = $_POST['visible_attributes'];
  $location = $_POST['location'];
  $img_url = $_POST['img'];
  $if_public = $_POST['if_public'];

  // Get User ID
  $cookie = $_SERVER['HTTP_COOKIE'];
  $session_key= explode("=", $cookie)[1];
  $sql = "SELECT * FROM User WHERE User.SessionKey = '".$session_key."'";
  $result = $conn->query($sql);
  $row = $result->fetch_assoc();
  $user_id = $row['UserID'];

  # if no images, use default image
  if($img_url === "null"){
    $img_url = "../uploadfile/images/default.jpg";
  }

  $value_str_two = join("', '", [$trip_id, $title, $start_day, $length, $travel_style_id, $travel_description, $remarks, $requirements, $budget, $visible_attributes, $img_url]);
  $value_str_three = join("', '", [$user_id, $trip_id]);

  $sql_insert_trip = "INSERT INTO Trips(TripID, Title, StartDate, Length, TravelStyleID, TripDescription, Remarks, Requirements, Budget, VisibleAttributes, ImgUrl) VALUES ('".$value_str_two."')";
  $sql_insert_public_trip = "INSERT INTO PublicTrips(TripID, Title, StartDate, Length, TravelStyleID, TripDescription, Remarks, Requirements, Budget, VisibleAttributes, ImgUrl) VALUES ('".$value_str_two."')";
  $result_insert_trip = $conn->query($sql_insert_trip);

  # insert into owns
  $sql_insert_owns = "INSERT INTO Owns(UserID, TripID) VALUES ('".$value_str_three."')";
  $result_insert_owns = $conn->query($sql_insert_owns);

  $result_insert_at = True;

  # if has location, insert location
  if($location){
    $sql_find_location = "SELECT Countries.ISO FROM Countries WHERE Countries.name = '".$location."'";
    $location_result = $conn->query($sql_find_location);
    while ($row = $location_result->fetch_assoc()) {
        $location_id = $row['ISO'];
    }
    $value_str_four = join("', '", [$trip_id, $location_id]);
    $sql_insert_at = "INSERT INTO At(TripID, LocationID) VALUES ('".$value_str_four."')";
    $result_insert_at = $conn->query($sql_insert_at);
  }

  $result_insert_public_trip = True;

  if ($if_public === "true"){
    $result_insert_public_trip = $conn->query($sql_insert_public_trip);
  }

  if (!$result_insert_trip or !$result_insert_public_trip or !$result_insert_owns or !$result_insert_at) {
    $resp = [
      'status' => 'fail',
      'message' => 'Error: '.$conn->error
    ];
  } else {
    $resp = [
      'status' => 'success',
      'message' => 'Update success!',
      'data' => []
    ];
  }

  $conn->close();
  // header('Content-Type: application/json');
  echo json_encode($resp);
?>
