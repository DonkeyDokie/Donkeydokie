

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

  $trip_id = $_POST['trip_info']['TripID'];
  $title = $_POST['trip_info']['Title'];
  $location = $_POST['trip_info']['Location'];
  $start_day = $_POST['trip_info']['StartDate'];
  $length = $_POST['trip_info']['Length'];
  $travel_style_id = $_POST['trip_info']['TravelStyleID'];
  $travel_description = $_POST['trip_info']['TripDescription'];
  $remarks = $_POST['trip_info']['Remarks'];
  $requirements = $_POST['trip_info']['Requirements'];
  $budget = $_POST['trip_info']['Budget'];
  $visible_attributes = $_POST['trip_info']['VisibleAttributes'];
  $img = $_POST['trip_info']['imgUrl'];

  if (!$img){
    $sql = "SELECT imgUrl FROM Trips WHERE Trips.tripID = '".$trip_id."'";
    $result = $conn->query($sql);
    while ($row = $result->fetch_assoc()) {
      $img = $row['ImgUrl'];
    }
  }

  $start_date = $start_day;
  
  $sql = "UPDATE Trips SET Title='".$title."', StartDate='".$start_date."', Length='".$length."', TravelStyleID='".$travel_style_id.
         "', TripDescription='".$travel_description."',Remarks='".$remarks."', Requirements='".$requirements.
         "', Budget='".$budget."', VisibleAttributes='".$visible_attributes."', ImgUrl='".$img."' WHERE TripID = ".$trip_id;

         $conn->query($sql);

  $sql = "UPDATE PublicTrips SET Title='".$title."', StartDate='".$start_date."', Length='".$length."', TravelStyleID='".$travel_style_id.
         "', TripDescription='".$travel_description."',Remarks='".$remarks."', Requirements='".$requirements.
         "', Budget='".$budget."', VisibleAttributes='".$visible_attributes."', ImgUrl='".$img."' WHERE TripID = ".$trip_id;
  
         $conn->query($sql);
  
  $sql_find_location = "SELECT Countries.ISO FROM Countries WHERE Countries.name = '".$location."'";
  $location_result = $conn->query($sql_find_location);
  while ($row = $location_result->fetch_assoc()) {
        $location_id = $row['ISO'];
  }
  
  $sql_exist_at = "SELECT DISTINCT count(*) AS COUNT FROM At WHERE At.LocationID = '".$location."'";
  $exist_result = $conn->query($sql_exist_at);
  while ($row = $exist_result->fetch_assoc()) {
        $exist = $row['COUNT'];
  }

  $value = join("', '", [$trip_id, $location_id]);

  if($exist > 0){
    $sql = "UPDATE At SET LocationID = '".$location_id."' WHERE TripID = '".$trip_id."'";
  } else {
    $sql = "INSERT INTO At(TripID, LocationID) VALUES ('".$value."')";
  }

  $result = $conn->query($sql);

  $resp = [
    'status' => 'success',
    'message' => 'Update successfully!'
  ];
  $conn->close();
  // header('Content-Type: application/json');
  echo json_encode($resp);
?>
