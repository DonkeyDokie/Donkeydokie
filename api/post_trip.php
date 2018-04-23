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
  $start_day = $_POST['startDay'];
  $length = $_POST['length'];
  $travel_style_id = $_POST['travelStyle'];
  $travel_description = $_POST['description'];
  $remarks = $_POST['remarks'];
  $requirements = $_POST['requirement'];
  $budget = $_POST['budget'];
  $location = $_POST['location'];
  $img_url = $_POST['imgUrl'];
  $is_public = $_POST['isPublic'];

  // Get User ID
  $cookie = $_SERVER['HTTP_COOKIE'];
  $session_key= explode("=", $cookie)[1];
  $sql = "SELECT * FROM User WHERE User.SessionKey = '".$session_key."'";
  $result = $conn->query($sql);
  $row = $result->fetch_assoc();
  $user_id = $row['UserID'];

  $value_str_two = join("', '", [$trip_id, $title, $start_day, $length, $travel_style_id, $travel_description, $remarks, $requirements, $budget, $img_url]);
  $value_str_three = join("', '", [$user_id, $trip_id]);

  $stmt_insert_trip = $conn->prepare("INSERT INTO Trips(TripID, Title, StartDate, Length, TravelStyleID, TripDescription, Remarks, Requirements, Budget, ImgUrl) VALUES (?,?,?,?,?,?,?,?,?,?)");
  $stmt_insert_trip->bind_param("issiisssds", $trip_id, $title, $start_day, $length, $travel_style_id, $travel_description, $remarks, $requirements, $budget, $img_url);

  $stmt_insert_public_trip = $conn->prepare("INSERT INTO PublicTrips(TripID, Title, StartDate, Length, TravelStyleID, TripDescription, Remarks, Requirements, Budget, ImgUrl) VALUES (?,?,?,?,?,?,?,?,?,?)");
  $stmt_insert_public_trip->bind_param("issiisssds", $trip_id, $title, $start_day, $length, $travel_style_id, $travel_description, $remarks, $requirements, $budget, $img_url);
  $result_insert_trip = $stmt_insert_trip->execute();

  # insert into owns
  $sql_insert_owns = "INSERT INTO Owns(UserID, TripID) VALUES ('".$value_str_three."')";
  $result_insert_owns = $conn->query($sql_insert_owns);

  $result_insert_at = True;

  # if has location, insert location
  if($location){
    $stmt_find_location = $conn->prepare("SELECT Countries.ISO FROM Countries WHERE Countries.name = ?");
    $stmt_find_location->bind_param("s", $location); 
    $stmt_find_location->execute();
    // $sql_find_location = "SELECT Countries.ISO FROM Countries WHERE Countries.name = '".$location."'";
    $location_result = $stmt_find_location->get_result();
    while ($row = $location_result->fetch_assoc()) {
        $location_id = $row['ISO'];
    }
    $value_str_four = join("', '", [$trip_id, $location_id]);
    $sql_insert_at = "INSERT INTO At(TripID, LocationID) VALUES ('".$value_str_four."')";
    $result_insert_at = $conn->query($sql_insert_at);
  }

  $result_insert_public_trip = True;

  if ($is_public === "true"){
    $result_insert_public_trip = $stmt_insert_public_trip->execute();
  }

  if (!$result_insert_trip or !$result_insert_public_trip or !$result_insert_owns or !$result_insert_at) {
    $resp = [
      'status' => 'fail',
      'message' => 'Error: '.$conn->error
    ];
  } else {
    $resp = [
      'status' => 'success',
      'message' => 'Trip has been post!',
      'data' => []
    ];
  }

  $conn->close();
  // header('Content-Type: application/json');
  echo json_encode($resp);
?>
