

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
  $start_date = $_POST['trip_info']['StartDate'];
  $length = $_POST['trip_info']['Length'];
  $travel_style_id = $_POST['trip_info']['TravelStyleID'];
  $travel_description = $_POST['trip_info']['TripDescription'];
  $remarks = $_POST['trip_info']['Remarks'];
  $requirements = $_POST['trip_info']['Requirements'];
  $budget = $_POST['trip_info']['Budget'];
  $visible_attributes = $_POST['trip_info']['VisibleAttributes'];
  $img = $_POST['trip_info']['imgUrl'];

  if ($img){
    $sql = "SELECT ImgUrl FROM Trips WHERE TripID = ".$trip_id;
    $result = $conn->query($sql);
    if (!$result) {
      echo 'Could not run query: ' . mysql_error();
      exit;
    }
    $img_url = $result->fetch_assoc()['ImgUrl'];
    if(strpos($img_url, "default") === false) {
      unlink($img_url);
    }

    $stmt1 = $conn->prepare("UPDATE Trips SET Title=?, StartDate=?, Length=?, TravelStyleID=?, TripDescription=?, Remarks=?, Requirements=?, Budget=?, ImgUrl=? WHERE TripID=?");
    $stmt1->bind_param("ssiisssdsi", $title, $start_date, $length, $travel_style_id, $travel_description, $remarks, $requirements, $budget, $img, $trip_id);
    $stmt2 = $conn->prepare("UPDATE PublicTrips SET Title=?, StartDate=?, Length=?, TravelStyleID=?, TripDescription=?, Remarks=?, Requirements=?, Budget=?, ImgUrl=? WHERE TripID=?");
    $stmt2->bind_param("ssiisssdsi", $title, $start_date, $length, $travel_style_id, $travel_description, $remarks, $requirements, $budget, $img, $trip_id);
  }
  else {
    $stmt1 = $conn->prepare("UPDATE Trips SET Title=?, StartDate=?, Length=?, TravelStyleID=?, TripDescription=?, Remarks=?, Requirements=?, Budget=? WHERE TripID=?");
    $stmt1->bind_param("ssiisssdi", $title, $start_date, $length, $travel_style_id, $travel_description, $remarks, $requirements, $budget, $trip_id);
    $stmt2 = $conn->prepare("UPDATE PublicTrips SET Title=?, StartDate=?, Length=?, TravelStyleID=?, TripDescription=?, Remarks=?, Requirements=?, Budget=? WHERE TripID=?");
    $stmt2->bind_param("ssiisssdi", $title, $start_date, $length, $travel_style_id, $travel_description, $remarks, $requirements, $budget, $trip_id);
  }

  $stmt1->execute();
  $stmt2->execute();
  
  $sql_find_location = "SELECT Countries.ISO FROM Countries WHERE Countries.name = '".$location."'";
  $location_result = $conn->query($sql_find_location);
  while ($row = $location_result->fetch_assoc()) {
        $location_id = $row['ISO'];
  }
  
  $sql_exist_at = "SELECT DISTINCT count(*) AS COUNT FROM At WHERE At.TripID = '".$trip_id."'";
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
    'message' => 'Update successfully!',
  ];
  $conn->close();
  // header('Content-Type: application/json');
  echo json_encode($resp);
?>
